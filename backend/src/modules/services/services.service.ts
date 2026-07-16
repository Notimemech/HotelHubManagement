import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { BookingService } from './entities/booking-service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { RequestServiceDto } from './dto/request-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
    @InjectRepository(BookingService)
    private bookingServiceRepo: Repository<BookingService>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async findAll() {
    return this.serviceRepo.find();
  }

  async requestService(customerId: number, dto: RequestServiceDto) {
    const booking = await this.bookingRepo.findOne({
      where: { BookingId: dto.BookingId, CustomerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const service = await this.serviceRepo.findOne({
      where: { ServiceId: dto.ServiceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const bookingService = this.bookingServiceRepo.create({
      BookingId: dto.BookingId,
      ServiceId: dto.ServiceId,
      Quantity: dto.Quantity,
    });

    await this.bookingServiceRepo.save(bookingService);

    // Update total price of the booking
    booking.TotalPrice =
      Number(booking.TotalPrice) + Number(service.Price) * dto.Quantity;
    await this.bookingRepo.save(booking);

    return {
      message: 'Service requested successfully',
      TotalPrice: booking.TotalPrice,
    };
  }
}
