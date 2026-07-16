import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { BookingService } from './entities/booking-service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { RequestServiceDto } from './dto/request-service.dto';
export declare class ServicesService {
    private serviceRepo;
    private bookingServiceRepo;
    private bookingRepo;
    constructor(serviceRepo: Repository<Service>, bookingServiceRepo: Repository<BookingService>, bookingRepo: Repository<Booking>);
    findAll(): Promise<Service[]>;
    requestService(customerId: number, dto: RequestServiceDto): Promise<{
        message: string;
        TotalPrice: number;
    }>;
}
