import { Customer } from '../../customers/entities/customer.entity';
import { BookingDetail } from './booking-detail.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { BookingService } from '../../services/entities/booking-service.entity';
export declare class Booking {
    BookingId: number;
    CustomerId: number;
    BookingDate: Date;
    CheckIn: Date;
    CheckOut: Date;
    Adults: number;
    Children: number;
    TotalPrice: number;
    SpecialRequest: string;
    Status: string;
    customer: Customer;
    details: BookingDetail[];
    payments: Payment[];
    services: BookingService[];
}
