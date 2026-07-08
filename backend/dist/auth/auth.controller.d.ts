import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
