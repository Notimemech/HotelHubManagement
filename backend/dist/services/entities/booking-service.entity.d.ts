import { Booking } from '../../bookings/entities/booking.entity';
import { Service } from './service.entity';
export declare class BookingService {
    BookingServiceId: number;
    BookingId: number;
    ServiceId: number;
    Quantity: number;
    booking: Booking;
    service: Service;
}
