import { Booking } from '../../bookings/entities/booking.entity';
export declare class Customer {
    CustomerId: number;
    FullName: string;
    Email: string;
    Phone: string;
    Password: string;
    Avatar: string;
    CreatedAt: Date;
    bookings: Booking[];
}
