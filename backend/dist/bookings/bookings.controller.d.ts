import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: any, dto: CreateBookingDto): Promise<{
        message: string;
        BookingId: number;
    }>;
    findAll(req: any): Promise<import("./entities/booking.entity").Booking[]>;
    findOne(req: any, id: number): Promise<import("./entities/booking.entity").Booking>;
    update(req: any, id: number, updateData: any): Promise<{
        message: string;
    }>;
    cancel(req: any, id: number): Promise<{
        message: string;
    }>;
}
