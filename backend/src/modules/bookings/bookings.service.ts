import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingVersion } from './entities/booking-version.entity';
import { BookingDetail } from './entities/booking-detail.entity';
import { Room } from '../rooms/entities/room.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

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

  async create(accountId: string, dto: CreateBookingDto) {
    const customerId = await this.resolveCustomerId(accountId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const checkIn = new Date(dto.checkIn);
      const checkOut = new Date(dto.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

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
        changeReason: 'Đặt phòng qua App',
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
      return { message: 'Booking created', bookingId: savedBooking.bookingId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
}
