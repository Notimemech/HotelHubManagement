import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingVersion)
    private versionRepo: Repository<BookingVersion>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
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

  async create(accountId: number, dto: CreatePaymentDto) {
    const customerId = await this.resolveCustomerId(accountId);

    const booking = await this.bookingRepo.findOne({
      where: { BookingId: dto.BookingId, CustomerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const version = await this.versionRepo.findOne({
      where: {
        BookingId: dto.BookingId,
        VersionNumber: booking.CurrentVersion,
      },
    });
    if (!version) throw new NotFoundException('Booking version not found');

    const payment = this.paymentRepo.create({
      VersionId: version.VersionId,
      BookingId: booking.BookingId,
      Amount: dto.Amount,
      Method: dto.Method,
      Status: 'Paid',
      PaidAt: new Date(),
    });
    const savedPayment = await this.paymentRepo.save(payment);

    if (booking.Status === 'Pending') {
      booking.Status = 'Confirmed';
      await this.bookingRepo.save(booking);
    }

    return { message: 'Payment successful', PaymentId: savedPayment.PaymentId };
  }

  async getHistory(accountId: number) {
    const customerId = await this.resolveCustomerId(accountId);
    return this.paymentRepo.find({
      where: { booking: { CustomerId: customerId } },
      relations: { booking: true, version: true },
      order: { PaidAt: 'DESC' },
    });
  }
}
