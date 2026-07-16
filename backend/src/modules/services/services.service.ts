import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { BookingService } from './entities/booking-service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { RequestServiceDto } from './dto/request-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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

  async create(dto: CreateServiceDto) {
    return this.serviceRepo.save(this.serviceRepo.create(dto));
  }

  async update(id: string, dto: UpdateServiceDto) {
    const svc = await this.serviceRepo.findOne({ where: { serviceId: id } });
    if (!svc) throw new NotFoundException('Service not found');
    Object.assign(svc, dto);
    return this.serviceRepo.save(svc);
  }

  async remove(id: string) {
    const svc = await this.serviceRepo.findOne({ where: { serviceId: id } });
    if (!svc) throw new NotFoundException('Service not found');
    const refCount = await this.bookingServiceRepo.count({
      where: { serviceId: id },
    });
    if (refCount > 0) {
      throw new ConflictException(
        `Cannot delete service: ${refCount} booking reference(s) exist`,
      );
    }
    await this.serviceRepo.remove(svc);
    return { message: 'Service deleted' };
  }

  async requestService(accountId: string, dto: RequestServiceDto) {
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