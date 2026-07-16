import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../app.module';

import { Account } from '../modules/accounts/entities/account.entity';
import { StaffInfo } from '../modules/staff/entities/staff-info.entity';
import { Customer } from '../modules/customers/entities/customer.entity';
import { RoomType } from '../modules/rooms/entities/room-type.entity';
import { Room } from '../modules/rooms/entities/room.entity';
import { Service } from '../modules/services/entities/service.entity';
import { ChecklistTemplate } from '../modules/housekeeping/entities/checklist-template.entity';
import { ChecklistLog } from '../modules/housekeeping/entities/checklist-log.entity';
import { Booking } from '../modules/bookings/entities/booking.entity';
import { BookingVersion } from '../modules/bookings/entities/booking-version.entity';
import { BookingDetail } from '../modules/bookings/entities/booking-detail.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { BookingService } from '../modules/services/entities/booking-service.entity';
import { IssueReport } from '../modules/maintenance/entities/issue-report.entity';
import { MaintenanceProve } from '../modules/maintenance/entities/maintenance-prove.entity';

import {
  STAFF_ACCOUNTS,
  CUSTOMER_ACCOUNTS,
} from './roles.seed';
import {
  ROOM_TYPES,
  ROOMS,
  SERVICES,
  CHECKLIST_TEMPLATES,
} from './lookup.seed';
import {
  BOOKINGS,
  CHECKLIST_LOGS,
  ISSUE_REPORTS,
} from './transactions.seed';

const DEFAULT_PASSWORD = '123456';

function diffDays(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
      // ponytail: business rows are wiped on every run so the seed stays
      // re-runnable end-to-end. Lookup rows (Accounts, StaffInfo, Customers,
      // RoomTypes, Rooms, Services, ChecklistTemplates) are kept via
      // upsert-style checks below. Upgrade path: split into seed:reset vs
      // seed:demo and skip this block on demo runs.
      await manager.query(
        'DELETE FROM BookingServices; DELETE FROM Payments; DELETE FROM BookingDetails; DELETE FROM BookingVersions; DELETE FROM Bookings; DELETE FROM ChecklistLogs; DELETE FROM MaintenanceProves; DELETE FROM IssueReports;',
      );

      const accountRepo = manager.getRepository(Account);
      const staffRepo = manager.getRepository(StaffInfo);
      const customerRepo = manager.getRepository(Customer);
      const roomTypeRepo = manager.getRepository(RoomType);
      const roomRepo = manager.getRepository(Room);
      const serviceRepo = manager.getRepository(Service);
      const checklistTemplateRepo = manager.getRepository(ChecklistTemplate);

      // 1. Accounts (staff + customer) + bcrypt
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const accounts: Record<string, Account> = {};
      const allAccounts = [...STAFF_ACCOUNTS, ...CUSTOMER_ACCOUNTS];
      for (const acc of allAccounts) {
        const existing = await accountRepo.findOne({
          where: { username: acc.username },
        });
        if (existing) {
          // ponytail: keep existing Account.Role untouched on re-seed to avoid
          // overwriting Manager role that an admin may have changed.
          // Upgrade path: pass --reset to clobber via seed:reset.
          accounts[acc.username] = existing;
          continue;
        }
        const created = await accountRepo.save(
          accountRepo.create({
            username: acc.username,
            password: hash,
            isActive: true,
            role: acc.role,
          }),
        );
        accounts[acc.username] = created;
      }

      // 2. StaffInfo
      for (const s of STAFF_ACCOUNTS) {
        const account = accounts[s.username];
        const exists = await staffRepo.findOne({ where: { cccd: s.cccd } });
        if (exists) continue;
        await staffRepo.save(
          staffRepo.create({
            accountId: account.accountId,
            cccd: s.cccd,
            fullName: s.fullName,
            phone: s.phone,
            address: s.address,
          }),
        );
      }

      // 3. Customers
      const customers: Record<string, Customer> = {};
      for (const c of CUSTOMER_ACCOUNTS) {
        const account = accounts[c.username];
        const existing = await customerRepo.findOne({
          where: { accountId: account.accountId },
        });
        const customer =
          existing ??
          (await customerRepo.save(
            customerRepo.create({
              accountId: account.accountId,
              fullName: c.fullName,
              email: c.email,
              phone: c.phone,
            }),
          ));
        customers[c.username] = customer;
      }

      // 4. RoomTypes
      const roomTypes: Record<string, RoomType> = {};
      const roomTypesById: Record<string, RoomType> = {};
      for (const rt of ROOM_TYPES) {
        const existing = await roomTypeRepo.findOne({
          where: { typeName: rt.typeName },
        });
        const created = existing ?? (await roomTypeRepo.save(roomTypeRepo.create(rt)));
        roomTypes[rt.typeName] = created;
        roomTypesById[created.typeId] = created;
      }

      // 5. Rooms (also build priceByRoomCode map for booking totals)
      const rooms: Record<string, Room> = {};
      for (const r of ROOMS) {
        const existing = await roomRepo.findOne({
          where: { roomCode: r.roomCode },
        });
        const room =
          existing ??
          (await roomRepo.save(
            roomRepo.create({
              roomCode: r.roomCode,
              floor: r.floor,
              status: r.status,
              typeId: roomTypes[r.typeName].typeId,
            }),
          ));
        rooms[r.roomCode] = room;
      }

      // 6. Services
      const services: Record<string, Service> = {};
      for (const s of SERVICES) {
        const existing = await serviceRepo.findOne({
          where: { serviceName: s.serviceName },
        });
        const svc =
          existing ?? (await serviceRepo.save(serviceRepo.create(s)));
        services[s.serviceName] = svc;
      }

      // 7. ChecklistTemplates
      for (const t of CHECKLIST_TEMPLATES) {
        const existing = await checklistTemplateRepo.findOne({
          where: { templateType: t.templateType, itemName: t.itemName },
        });
        if (existing) continue;
        await checklistTemplateRepo.save(checklistTemplateRepo.create(t));
      }

      // ---- Business data starts here ----
      const bookingRepo = manager.getRepository(Booking);
      const bookingVersionRepo = manager.getRepository(BookingVersion);
      const bookingDetailRepo = manager.getRepository(BookingDetail);
      const paymentRepo = manager.getRepository(Payment);
      const bookingServiceRepo = manager.getRepository(BookingService);
      const checklistLogRepo = manager.getRepository(ChecklistLog);
      const issueReportRepo = manager.getRepository(IssueReport);
      const maintenanceProveRepo = manager.getRepository(MaintenanceProve);

      const staffByUsername: Record<string, StaffInfo> = {};
      for (const s of STAFF_ACCOUNTS) {
        staffByUsername[s.username] = await staffRepo.findOneOrFail({
          where: { accountId: accounts[s.username].accountId },
        });
      }

      // 8. Bookings + version 1 + details + services + payment
      for (const b of BOOKINGS) {
        const existing = await bookingRepo
          .createQueryBuilder('b')
          .innerJoin('b.versions', 'v')
          .where('b.customerId = :cid', {
            cid: customers[b.customerUsername].customerId,
          })
          .andWhere('CAST(v.CheckIn AS DATE) = :checkIn', {
            checkIn: b.version.checkIn,
          })
          .getOne();
        if (existing) continue;

        const nightsList = b.version.roomCodes.map((code) =>
          diffDays(b.version.checkIn, b.version.checkOut),
        );
        const roomTotal = b.version.roomCodes.reduce((sum, code, i) => {
          const room = rooms[code];
          const roomType = roomTypesById[room.typeId];
          return sum + Number(roomType.price) * nightsList[i];
        }, 0);
        const svcTotal = (b.version.serviceItems ?? []).reduce(
          (sum, item) => sum + Number(services[item.serviceName].price) * item.quantity,
          0,
        );
        const total = roomTotal + svcTotal;

        const booking = (await bookingRepo.save(
          bookingRepo.create({
            customerId: customers[b.customerUsername].customerId,
            currentVersion: 1,
            totalPrice: total,
            status: b.bookingStatus,
          }),
        )) as Booking;

        const version = (await bookingVersionRepo.save(
          bookingVersionRepo.create({
            bookingId: booking.bookingId,
            versionNumber: 1,
            checkIn: new Date(b.version.checkIn),
            checkOut: new Date(b.version.checkOut),
            adults: b.version.adults,
            children: b.version.children,
            specialRequest: b.version.specialRequest ?? null,
            totalAmountAtThisVersion: total,
            staffInChargeId: b.version.staffUsername
              ? staffByUsername[b.version.staffUsername]?.staffId ?? null
              : null,
            changeReason: 'Initial booking',
          } as Partial<BookingVersion>),
        )) as BookingVersion;

        for (let i = 0; i < b.version.roomCodes.length; i++) {
          const code = b.version.roomCodes[i];
          const nights = nightsList[i];
          const roomType = roomTypesById[rooms[code].typeId];
          await bookingDetailRepo.save(
            bookingDetailRepo.create({
              versionId: version.versionId,
              roomId: rooms[code].roomId,
              price: Number(roomType.price),
              nights,
            }),
          );
        }

        for (const item of b.version.serviceItems ?? []) {
          await bookingServiceRepo.save(
            bookingServiceRepo.create({
              bookingId: booking.bookingId,
              serviceId: services[item.serviceName].serviceId,
              quantity: item.quantity,
            }),
          );
        }

        await paymentRepo.save(
          paymentRepo.create({
            versionId: version.versionId,
            bookingId: booking.bookingId,
            amount: b.version.payment.amount,
            method: b.version.payment.method,
            status: b.version.payment.status,
            paidAt: b.version.payment.status === 'Paid' ? new Date() : null,
            externalTransactionId:
              b.version.payment.status === 'Paid'
                ? `TX-${Date.now()}-${booking.bookingId.slice(0, 6)}`
                : null,
          } as Partial<Payment>),
        );
      }

      // 9. Checklist logs
      for (const log of CHECKLIST_LOGS) {
        const exists = await checklistLogRepo.findOne({
          where: {
            roomId: rooms[log.roomCode].roomId,
            staffId: staffByUsername[log.staffUsername].staffId,
            notes: log.notes,
          },
        });
        if (exists) continue;
        await checklistLogRepo.save(
          checklistLogRepo.create({
            roomId: rooms[log.roomCode].roomId,
            staffId: staffByUsername[log.staffUsername].staffId,
            templateType: log.templateType,
            notes: log.notes,
          }),
        );
      }

      // 10. Issue reports (+ maintenance prove when resolved)
      for (const issue of ISSUE_REPORTS) {
        const reporter = staffByUsername[issue.reporterUsername];
        const exists = await issueReportRepo.findOne({
          where: {
            roomId: rooms[issue.roomCode].roomId,
            reporterId: reporter.staffId,
            description: issue.description,
          },
        });
        const issueRow = (exists ??
          (await issueReportRepo.save(
            issueReportRepo.create({
              roomId: rooms[issue.roomCode].roomId,
              reporterId: reporter.staffId,
              description: issue.description,
              status: issue.status,
            }),
          ))) as IssueReport;
        if (issue.resolved) {
          const proveExists = await maintenanceProveRepo.findOne({
            where: { issueId: issueRow.issueId },
          });
          if (proveExists) continue;
          const maintainer =
            staffByUsername[issue.resolved.maintainerUsername];
          await maintenanceProveRepo.save(
            maintenanceProveRepo.create({
              issueId: issueRow.issueId,
              maintainerId: maintainer.staffId,
              finishImage: issue.resolved.finishImage,
              finishVideo: issue.resolved.finishVideo,
            }),
          );
        }
      }
    });

    // Báo cáo số dòng cuối cùng (sau khi transaction commit)
    const counts = {
      Accounts: await dataSource.getRepository(Account).count(),
      StaffInfo: await dataSource.getRepository(StaffInfo).count(),
      Customers: await dataSource.getRepository(Customer).count(),
      RoomTypes: await dataSource.getRepository(RoomType).count(),
      Rooms: await dataSource.getRepository(Room).count(),
      Services: await dataSource.getRepository(Service).count(),
      ChecklistTemplates: await dataSource
        .getRepository(ChecklistTemplate)
        .count(),
      Bookings: await dataSource.getRepository(Booking).count(),
      BookingVersions: await dataSource.getRepository(BookingVersion).count(),
      BookingDetails: await dataSource.getRepository(BookingDetail).count(),
      Payments: await dataSource.getRepository(Payment).count(),
      BookingServices: await dataSource.getRepository(BookingService).count(),
      ChecklistLogs: await dataSource.getRepository(ChecklistLog).count(),
      IssueReports: await dataSource.getRepository(IssueReport).count(),
      MaintenanceProves: await dataSource
        .getRepository(MaintenanceProve)
        .count(),
    };

    // eslint-disable-next-line no-console
    console.log('[seed] Done. Row counts:');
    for (const [key, value] of Object.entries(counts)) {
      // eslint-disable-next-line no-console
      console.log(`  ${key}: ${value}`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});