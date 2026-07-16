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

const DEFAULT_PASSWORD = '123456';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
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
      for (const c of CUSTOMER_ACCOUNTS) {
        const account = accounts[c.username];
        const exists = await customerRepo.findOne({
          where: { accountId: account.accountId },
        });
        if (exists) continue;
        await customerRepo.save(
          customerRepo.create({
            accountId: account.accountId,
            fullName: c.fullName,
            email: c.email,
            phone: c.phone,
          }),
        );
      }

      // 4. RoomTypes
      const roomTypes: Record<string, RoomType> = {};
      for (const rt of ROOM_TYPES) {
        const existing = await roomTypeRepo.findOne({
          where: { typeName: rt.typeName },
        });
        if (existing) {
          roomTypes[rt.typeName] = existing;
          continue;
        }
        const created = await roomTypeRepo.save(roomTypeRepo.create(rt));
        roomTypes[rt.typeName] = created;
      }

      // 5. Rooms
      for (const r of ROOMS) {
        const existing = await roomRepo.findOne({
          where: { roomCode: r.roomCode },
        });
        if (existing) continue;
        await roomRepo.save(
          roomRepo.create({
            roomCode: r.roomCode,
            floor: r.floor,
            status: r.status,
            typeId: roomTypes[r.typeName].typeId,
          }),
        );
      }

      // 6. Services
      for (const s of SERVICES) {
        const existing = await serviceRepo.findOne({
          where: { serviceName: s.serviceName },
        });
        if (existing) continue;
        await serviceRepo.save(serviceRepo.create(s));
      }

      // 7. ChecklistTemplates
      for (const t of CHECKLIST_TEMPLATES) {
        const existing = await checklistTemplateRepo.findOne({
          where: { templateType: t.templateType, itemName: t.itemName },
        });
        if (existing) continue;
        await checklistTemplateRepo.save(checklistTemplateRepo.create(t));
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
      ChecklistTemplates: await dataSource.getRepository(ChecklistTemplate).count(),
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
