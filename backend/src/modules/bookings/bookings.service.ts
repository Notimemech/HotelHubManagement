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

  private async resolveCustomerId(accountId: number): Promise<number> {
    const c = await this.customerRepo.findOne({
      where: { AccountId: accountId },
    });
    if (!c)
      throw new NotFoundException(
        'Customer profile not found for this account',
      );
    return c.CustomerId;
  }

  async create(accountId: number, dto: CreateBookingDto) {
    const customerId = await this.resolveCustomerId(accountId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const checkIn = new Date(dto.CheckIn);
      const checkOut = new Date(dto.CheckOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const rooms = await queryRunner.manager.find(Room, {
        where: { RoomId: In(dto.RoomIds) },
        relations: { roomType: true },
      });
      if (rooms.length !== dto.RoomIds.length) {
        throw new BadRequestException('Some rooms were not found');
      }

      let totalPrice = 0;
      for (const room of rooms) {
        totalPrice += Number(room.roomType.Price) * nights;
      }

      const booking = queryRunner.manager.create(Booking, {
        CustomerId: customerId,
        CurrentVersion: 1,
        TotalPrice: totalPrice,
        Status: 'Pending',
      });
      const savedBooking = await queryRunner.manager.save(booking);

      const version = queryRunner.manager.create(BookingVersion, {
        BookingId: savedBooking.BookingId,
        VersionNumber: 1,
        CheckIn: checkIn,
        CheckOut: checkOut,
        Adults: dto.Adults,
        Children: dto.Children,
        SpecialRequest: dto.SpecialRequest,
        TotalAmountAtThisVersion: totalPrice,
        ChangeReason: 'Đặt phòng qua App',
      });
      const savedVersion = await queryRunner.manager.save(version);

      for (const room of rooms) {
        await queryRunner.manager.save(
          queryRunner.manager.create(BookingDetail, {
            VersionId: savedVersion.VersionId,
            RoomId: room.RoomId,
            Price: room.roomType.Price,
            Nights: nights,
          }),
        );
      }

      await queryRunner.commitTransaction();
      return { message: 'Booking created', BookingId: savedBooking.BookingId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(accountId: number) {
    const customerId = await this.resolveCustomerId(accountId);
    return this.bookingRepo.find({
      where: { CustomerId: customerId },
      order: { BookingDate: 'DESC' },
    });
  }

  async findOne(accountId: number, bookingId: number) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: bookingId, CustomerId: customerId },
      relations: {
        versions: { details: { room: true }, payments: true },
        payments: true,
        services: { service: true },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async listVersions(accountId: number, bookingId: number) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: bookingId, CustomerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.versionRepo.find({
      where: { BookingId: bookingId },
      relations: {
        details: { room: true },
        payments: true,
        staffInCharge: true,
      },
      order: { VersionNumber: 'ASC' },
    });
  }

  async update(accountId: number, bookingId: number, updateData: any) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: bookingId, CustomerId: customerId },
      relations: { versions: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.Status === 'Cancelled' || booking.Status === 'Completed') {
      throw new BadRequestException('Cannot modify this booking');
    }

    const latest = booking.versions.sort(
      (a, b) => b.VersionNumber - a.VersionNumber,
    )[0];
    const nextVersion = (latest?.VersionNumber ?? 0) + 1;

    const newTotal =
      updateData.TotalPrice ?? latest?.TotalAmountAtThisVersion ?? 0;

    await this.dataSource.transaction(async (manager) => {
      const newVer = manager.create(BookingVersion, {
        BookingId: booking.BookingId,
        VersionNumber: nextVersion,
        CheckIn: updateData.CheckIn
          ? new Date(updateData.CheckIn)
          : latest?.CheckIn,
        CheckOut: updateData.CheckOut
          ? new Date(updateData.CheckOut)
          : latest?.CheckOut,
        Adults: updateData.Adults ?? latest?.Adults,
        Children: updateData.Children ?? latest?.Children,
        SpecialRequest: updateData.SpecialRequest ?? latest?.SpecialRequest,
        TotalAmountAtThisVersion: newTotal,
        ChangeReason: updateData.ChangeReason ?? 'Customer update',
      });
      const savedVer = await manager.save(newVer);

      booking.CurrentVersion = nextVersion;
      booking.TotalPrice = newTotal;
      await manager.save(booking);

      return savedVer;
    });
    return { message: 'Booking updated; new version created' };
  }

  async cancel(accountId: number, bookingId: number) {
    const customerId = await this.resolveCustomerId(accountId);
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: bookingId, CustomerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.Status === 'Cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }
    booking.Status = 'Cancelled';
    await this.bookingRepo.save(booking);
    return { message: 'Booking cancelled' };
  }
}
