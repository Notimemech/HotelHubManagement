import { CustomersService } from './customers.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    getProfile(req: any): Promise<{
        CustomerId: number;
        FullName: string;
        Email: string;
        Phone: string;
        Avatar: string;
        CreatedAt: Date;
        bookings: import("../bookings/entities/booking.entity").Booking[];
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        CustomerId: number;
        FullName: string;
        Email: string;
        Phone: string;
        Avatar: string;
        CreatedAt: Date;
        bookings: import("../bookings/entities/booking.entity").Booking[];
    }>;
}
