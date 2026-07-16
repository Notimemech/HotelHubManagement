import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async create(customerId: number, dto: CreatePaymentDto) {
    const booking = await this.bookingRepo.findOne({ where: { BookingId: dto.BookingId, CustomerId: customerId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const payment = this.paymentRepo.create({
      BookingId: dto.BookingId,
      Amount: dto.Amount,
      Method: dto.Method,
      Status: 'Paid',
      PaidAt: new Date()
    });

    const savedPayment = await this.paymentRepo.save(payment);
    
    // Optionally update booking status
    if (booking.Status === 'Pending') {
      booking.Status = 'Confirmed';
      await this.bookingRepo.save(booking);
    }

    return { message: 'Payment successful', PaymentId: savedPayment.PaymentId };
  }

  async getHistory(customerId: number) {
    return this.paymentRepo.find({
      where: { booking: { CustomerId: customerId } },
      relations: { booking: true },
      order: { PaidAt: 'DESC' }
    });
  }
}
