import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private paymentRepo;
    private bookingRepo;
    constructor(paymentRepo: Repository<Payment>, bookingRepo: Repository<Booking>);
    create(customerId: number, dto: CreatePaymentDto): Promise<{
        message: string;
        PaymentId: number;
    }>;
    getHistory(customerId: number): Promise<Payment[]>;
}
