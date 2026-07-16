import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Booking } from './entities/booking.entity';
import { BookingVersion } from './entities/booking-version.entity';
import { BookingDetail } from './entities/booking-detail.entity';
import { Room } from '../rooms/entities/room.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountsService } from '../accounts/accounts.service';
import { StaffService } from '../staff/staff.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateWalkInBookingDto } from './dto/create-walk-in-booking.dto';
import { ListBookingsFilterDto } from './dto/list-bookings-filter.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingVersion)
    private versionRepo: Repository<BookingVersion>,
    @InjectRepository(BookingDetail)
    private detailRepo: Repository<BookingDetail>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private readonly accountsService: AccountsService,
    private readonly staffService: StaffService,
    private dataSource: DataSource,
  ) {}

  private async resolveCustomerId(accountId: string): Promise<string> {
    const c = await this.customerRepo.findOne({
      where: { accountId: accountId },
    });
    if (!c)
      throw new NotFoundException(
        'Customer profile not found for this account',
      );
    return c.customerId;
  }

  /**
   * Core booking-insert transaction. Reused by both self-bookings (Customer)
   * and walk-in bookings (Receptionist on behalf of guest).
   */
  private async createBookingForCustomer(
    customerId: string,
    dto: CreateBookingDto,
    opts?: { staffInChargeId?: string; changeReason?: string },
  ) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rooms = await queryRunner.manager.find(Room, {
        where: { roomId: In(dto.roomIds) },
        relations: { roomType: true },
      });
      if (rooms.length !== dto.roomIds.length) {
        throw new BadRequestException('Some rooms were not found');
      }

      let totalPrice = 0;
      for (const room of rooms) {
        totalPrice += Number(room.roomType.price) * nights;
      }

      const booking = queryRunner.manager.create(Booking, {
        customerId: customerId,
        currentVersion: 1,
        totalPrice: totalPrice,
        status: 'Pending',
      });
      const savedBooking = await queryRunner.manager.save(booking);

      const version = queryRunner.manager.create(BookingVersion, {
        bookingId: savedBooking.bookingId,
        versionNumber: 1,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: dto.adults,
        children: dto.children,
        specialRequest: dto.specialRequest,
        totalAmountAtThisVersion: totalPrice,
        ...(opts?.staffInChargeId
          ? { staffInChargeId: opts.staffInChargeId }
          : {}),
        changeReason: opts?.changeReason ?? 'Đặt phòng qua App',
      });
      const savedVersion = await queryRunner.manager.save(version);

      for (const room of rooms) {
        await queryRunner.manager.save(
          queryRunner.manager.create(BookingDetail, {
            versionId: savedVersion.versionId,
            roomId: room.roomId,
            price: room.roomType.price,
            nights: nights,
          }),
        );
      }

      await queryRunner.commitTransaction();
      return { bookingId: savedBooking.bookingId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async create(accountId: string, dto: CreateBookingDto) {
    const customerId = await this.resolveCustomerId(accountId);
    const { bookingId } = await this.createBookingForCustomer(customerId, dto);
    return { message: 'Booking created', bookingId };
  }

  /**
   * Walk-in booking: receptionist creates a Booking on behalf of a guest who
   * does not yet have an account. The guest is auto-registered with a stub
   * Account (username = walkin_<phone>) so the existing UNIQUE NOT NULL FK on
   * Customers.AccountId remains satisfied. Returns the new bookingId,
   * customerId and an isNewCustomer flag.
   */
  async createWalkIn(
    receptionistAccountId: string,
    dto: CreateWalkInBookingDto,
  ) {
    // 1. Verify caller is a staff member and resolve their StaffInfo.
    const staff = await this.staffService.findByAccountId(receptionistAccountId);
    if (!staff) throw new ForbiddenException('Not a staff member');

    // 2. Upsert Customer by phone; create stub Account if new.
    let customer = await this.customerRepo.findOne({
      where: { phone: dto.customerPhone },
    });
    let isNewCustomer = false;

    if (!customer) {
      try {
        customer = await this.dataSource.transaction(async (manager) => {
          const placeholderPassword = await bcrypt.hash(
            `walkin_${Date.now()}_${Math.random()}`,
            10,
          );
          const stubAccount = await this.accountsService.create(
            `walkin_${dto.customerPhone}`,
            placeholderPassword,
          );
          await this.accountsService.setRole(stubAccount.accountId, 'User');
          return manager.save(
            manager.create(Customer, {
              accountId: stubAccount.accountId,
              fullName: dto.customerFullName,
              email: dto.customerEmail,
              phone: dto.customerPhone,
            }),
          );
        });
        isNewCustomer = true;
      } catch (err) {
        if (err instanceof QueryFailedError) {
          throw new ConflictException(
            'Customer with this phone/email already exists',
          );
        }
        throw err;
      }
    }

    // 3. Run the shared booking-insert transaction, tagging the receptionist.
    const { bookingId } = await this.createBookingForCustomer(
      customer!.customerId,
      dto,
      {
        staffInChargeId: staff.staffId,
        changeReason: 'Walk-in booking by Receptionist',
      },
    );

    return {
      message: 'Walk-in booking created',
      bookingId,
      customerId: customer!.customerId,
      isNewCustomer,
    };
  }

  async findAll(accountId: string) {
    const customerId = await this.resolveCustomerId(accountId);
    return this.bookingRepo.find({
      where: { customerId: customerId },
      order: { bookingDate: 'DESC' },
    });
  }

  async findOne(accountId: string, bookingId: string) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { bookingId: bookingId, customerId: customerId },
      relations: {
        versions: { details: { room: true }, payments: true },
        payments: true,
        services: { service: true },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async listVersions(accountId: string, bookingId: string) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { bookingId: bookingId, customerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.versionRepo.find({
      where: { bookingId: bookingId },
      relations: {
        details: { room: true },
        payments: true,
        staffInCharge: true,
      },
      order: { versionNumber: 'ASC' },
    });
  }

  async update(accountId: string, bookingId: string, updateData: any) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { bookingId: bookingId, customerId: customerId },
      relations: { versions: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      throw new BadRequestException('Cannot modify this booking');
    }

    const latest = booking.versions.sort(
      (a, b) => b.versionNumber - a.versionNumber,
    )[0];
    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const newTotal =
      updateData.totalPrice ?? latest?.totalAmountAtThisVersion ?? 0;

    await this.dataSource.transaction(async (manager) => {
      const newVer = manager.create(BookingVersion, {
        bookingId: booking.bookingId,
        versionNumber: nextVersion,
        checkIn: updateData.checkIn
          ? new Date(updateData.checkIn)
          : latest?.checkIn,
        checkOut: updateData.checkOut
          ? new Date(updateData.checkOut)
          : latest?.checkOut,
        adults: updateData.adults ?? latest?.adults,
        children: updateData.children ?? latest?.children,
        specialRequest: updateData.specialRequest ?? latest?.specialRequest,
        totalAmountAtThisVersion: newTotal,
        changeReason: updateData.changeReason ?? 'Customer update',
      });
      await manager.save(newVer);

      booking.currentVersion = nextVersion;
      booking.totalPrice = newTotal;
      await manager.save(booking);
    });
    return { message: 'Booking updated; new version created' };
  }

  async cancel(accountId: string, bookingId: string) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { bookingId: bookingId, customerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'Cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }
    booking.status = 'Cancelled';
    await this.bookingRepo.save(booking);
    return { message: 'Booking cancelled' };
  }

  /* ============================================================
   * Manager / Receptionist / Saler scoped views
   * ============================================================ */

  async findAllForStaff(filter: ListBookingsFilterDto) {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.customer', 'customer')
      .leftJoinAndSelect('b.versions', 'v')
      .leftJoinAndSelect('v.details', 'd')
      .leftJoinAndSelect('d.room', 'room')
      .leftJoinAndSelect('b.payments', 'payments')
      .orderBy('b.BookingDate', 'DESC');

    if (filter.status) {
      qb.andWhere('b.Status = :status', { status: filter.status });
    }
    if (filter.from) {
      qb.andWhere('b.BookingDate >= :from', { from: filter.from });
    }
    if (filter.to) {
      qb.andWhere('b.BookingDate <= :to', { to: filter.to });
    }
    if (filter.q) {
      qb.andWhere(
        '(customer.FullName LIKE :q OR customer.Phone LIKE :q)',
        { q: `%${filter.q}%` },
      );
    }
    return qb.getMany();
  }

  async findOneForStaff(bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { bookingId },
      relations: {
        customer: true,
        versions: {
          details: { room: { roomType: true } },
          payments: true,
          staffInCharge: true,
        },
        payments: true,
        services: { service: true },
      },
      order: { versions: { versionNumber: 'ASC' } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async listVersionsForStaff(bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.versionRepo.find({
      where: { bookingId },
      relations: {
        details: { room: true },
        payments: true,
        staffInCharge: true,
      },
      order: { versionNumber: 'ASC' },
    });
  }

  async checkout(bookingId: string) {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { bookingId },
        relations: { versions: { details: true } },
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.status === 'Cancelled') {
        throw new BadRequestException('Cannot check out a cancelled booking');
      }
      if (booking.status === 'Completed') {
        throw new BadRequestException('Booking is already completed');
      }

      booking.status = 'Completed';
      await manager.save(booking);

      const roomIds = new Set<string>();
      booking.versions?.forEach((v) => {
        v.details?.forEach((d) => roomIds.add(d.roomId));
      });

      for (const roomId of roomIds) {
        const overlapping = await manager
          .createQueryBuilder(BookingVersion, 'v')
          .innerJoin('v.details', 'd')
          .innerJoin(Booking, 'b', 'b.BookingId = v.BookingId')
          .where('d.RoomId = :roomId', { roomId })
          .andWhere('b.BookingId <> :bookingId', { bookingId })
          .andWhere("b.Status IN ('Pending', 'Confirmed')")
          .getCount();

        if (overlapping === 0) {
          await manager.update(Room, { roomId }, { status: 'Available' });
        }
      }

      return { message: 'Booking checked out', bookingId, completedAt: new Date() };
    });
  }
}