import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsFilterDto } from './dto/list-payments-filter.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingVersion)
    private versionRepo: Repository<BookingVersion>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
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

  async create(accountId: string, dto: CreatePaymentDto) {
    const customerId = await this.resolveCustomerId(accountId);

    const booking = await this.bookingRepo.findOne({
      where: { bookingId: dto.bookingId, customerId: customerId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const version = await this.versionRepo.findOne({
      where: {
        bookingId: dto.bookingId,
        versionNumber: booking.currentVersion,
      },
    });
    if (!version) throw new NotFoundException('Booking version not found');

    const payment = this.paymentRepo.create({
      versionId: version.versionId,
      bookingId: booking.bookingId,
      amount: dto.amount,
      method: dto.method,
      status: 'Paid',
      paidAt: new Date(),
    });
    const savedPayment = await this.paymentRepo.save(payment);

    if (booking.status === 'Pending') {
      booking.status = 'Confirmed';
      await this.bookingRepo.save(booking);
    }

    return { message: 'Payment successful', paymentId: savedPayment.paymentId };
  }

  async getHistory(accountId: string) {
    const customerId = await this.resolveCustomerId(accountId);
    return this.paymentRepo.find({
      where: { booking: { customerId: customerId } },
      relations: { booking: true, version: true },
      order: { paidAt: 'DESC' },
    });
  }

  async findAllAdmin(filter: ListPaymentsFilterDto) {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('p.version', 'version')
      .orderBy('p.PaidAt', 'DESC');

    if (filter.status) qb.andWhere('p.Status = :status', { status: filter.status });
    if (filter.method) qb.andWhere('p.Method = :method', { method: filter.method });
    if (filter.bookingId) qb.andWhere('p.BookingId = :bid', { bid: filter.bookingId });
    if (filter.from) qb.andWhere('p.PaidAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('p.PaidAt <= :to', { to: filter.to });

    const payments = await qb.getMany();
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { payments, total };
  }

  async findByBookingId(bookingId: string) {
    return this.paymentRepo.find({
      where: { bookingId },
      relations: { version: true },
      order: { paidAt: 'DESC' },
    });
  }

  async getBookingSummary(bookingId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { bookingId },
      relations: {
        versions: { details: { room: { roomType: true } }, payments: true },
        services: { service: true },
        customer: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const totalPaid = booking.versions
      ?.flatMap((v) => v.payments ?? [])
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

    const totalServices = booking.services
      ?.reduce(
        (sum, bs) => sum + Number(bs.service?.price ?? 0) * bs.quantity,
        0,
      ) ?? 0;

    return {
      booking,
      totalPaid,
      totalServices,
      outstanding: Number(booking.totalPrice) - totalPaid,
    };
  }
}