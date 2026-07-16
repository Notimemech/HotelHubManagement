import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class CustomersService {
    private customerRepo;
    constructor(customerRepo: Repository<Customer>);
    getProfile(customerId: number): Promise<{
        CustomerId: number;
        FullName: string;
        Email: string;
        Phone: string;
        Avatar: string;
        CreatedAt: Date;
        bookings: import("../bookings/entities/booking.entity").Booking[];
    }>;
    updateProfile(customerId: number, dto: UpdateProfileDto): Promise<{
        CustomerId: number;
        FullName: string;
        Email: string;
        Phone: string;
        Avatar: string;
        CreatedAt: Date;
        bookings: import("../bookings/entities/booking.entity").Booking[];
    }>;
}
