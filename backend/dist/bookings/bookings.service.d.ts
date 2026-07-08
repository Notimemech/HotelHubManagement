import { Repository, DataSource } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingDetail } from './entities/booking-detail.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private bookingRepo;
    private bookingDetailRepo;
    private roomRepo;
    private dataSource;
    constructor(bookingRepo: Repository<Booking>, bookingDetailRepo: Repository<BookingDetail>, roomRepo: Repository<Room>, dataSource: DataSource);
    create(customerId: number, dto: CreateBookingDto): Promise<{
        message: string;
        BookingId: number;
    }>;
    findAll(customerId: number): Promise<Booking[]>;
    findOne(customerId: number, bookingId: number): Promise<Booking>;
    update(customerId: number, bookingId: number, updateData: any): Promise<{
        message: string;
    }>;
    cancel(customerId: number, bookingId: number): Promise<{
        message: string;
    }>;
}
