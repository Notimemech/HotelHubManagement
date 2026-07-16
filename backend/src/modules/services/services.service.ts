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

  async requestService(accountId: string, dto: RequestServiceDto) {
    // Resolve customer id from account id (JWT sub).
    // We can't inject Customer repo here without changing ctor signature, so look up via Booking.customerId.
    const booking = await this.bookingRepo.findOne({
      where: { bookingId: dto.bookingId },
      relations: { customer: true },
    });
    if (!booking || booking.customer?.accountId !== accountId)
      throw new NotFoundException('Booking not found');

    const service = await this.serviceRepo.findOne({
      where: { serviceId: dto.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const bookingService = this.bookingServiceRepo.create({
      bookingId: dto.bookingId,
      serviceId: dto.serviceId,
      quantity: dto.quantity,
    });

    await this.bookingServiceRepo.save(bookingService);

    booking.totalPrice =
      Number(booking.totalPrice) + Number(service.price) * dto.quantity;
    await this.bookingRepo.save(booking);

    return {
      message: 'Service requested successfully',
      totalPrice: booking.totalPrice,
    };
  }
}
