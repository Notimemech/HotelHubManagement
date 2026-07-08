import { Booking } from '../../bookings/entities/booking.entity';
export declare class Payment {
    PaymentId: number;
    BookingId: number;
    Amount: number;
    Method: string;
    Status: string;
    PaidAt: Date;
    booking: Booking;
}
