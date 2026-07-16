import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingDetail } from './entities/booking-detail.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingDetail) private bookingDetailRepo: Repository<BookingDetail>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    private dataSource: DataSource
  ) {}

  async create(customerId: number, dto: CreateBookingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const checkIn = new Date(dto.CheckIn);
      const checkOut = new Date(dto.CheckOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const rooms = await queryRunner.manager.find(Room, { where: { RoomId: In(dto.RoomIds) }, relations: { roomType: true } });
      if (rooms.length !== dto.RoomIds.length) {
        throw new BadRequestException('Some rooms were not found');
      }

      let totalPrice = 0;
      for (const room of rooms) {
        totalPrice += Number(room.roomType.Price) * nights;
      }

      const booking = queryRunner.manager.create(Booking, {
        CustomerId: customerId,
        CheckIn: checkIn,
        CheckOut: checkOut,
        Adults: dto.Adults,
        Children: dto.Children,
        TotalPrice: totalPrice,
        SpecialRequest: dto.SpecialRequest,
        Status: 'Pending',
      });

      const savedBooking = await queryRunner.manager.save(booking);

      for (const room of rooms) {
        const detail = queryRunner.manager.create(BookingDetail, {
          BookingId: savedBooking.BookingId,
          RoomId: room.RoomId,
          Price: room.roomType.Price,
          Nights: nights,
        });
        await queryRunner.manager.save(detail);
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

  async findAll(customerId: number) {
    return this.bookingRepo.find({
      where: { CustomerId: customerId },
      order: { BookingDate: 'DESC' }
    });
  }

  async findOne(customerId: number, bookingId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: bookingId, CustomerId: customerId },
      relations: { details: { room: true }, payments: true, services: { service: true } }
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(customerId: number, bookingId: number, updateData: any) {
    const booking = await this.findOne(customerId, bookingId);
    if (booking.Status === 'Cancelled' || booking.Status === 'Completed') {
      throw new BadRequestException('Cannot modify this booking');
    }

    if (updateData.Adults) booking.Adults = updateData.Adults;
    if (updateData.Children) booking.Children = updateData.Children;
    if (updateData.SpecialRequest) booking.SpecialRequest = updateData.SpecialRequest;

    await this.bookingRepo.save(booking);
    return { message: 'Booking updated' };
  }

  async cancel(customerId: number, bookingId: number) {
    const booking = await this.findOne(customerId, bookingId);
    if (booking.Status === 'Cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }
    booking.Status = 'Cancelled';
    await this.bookingRepo.save(booking);
    return { message: 'Booking cancelled' };
  }
}
