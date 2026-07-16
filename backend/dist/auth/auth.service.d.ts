import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../customers/entities/customer.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthService {
    private readonly customerRepo;
    private jwtService;
    constructor(customerRepo: Repository<Customer>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        CustomerId: number;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    logout(): {
        message: string;
    };
    changePassword(customerId: number, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
