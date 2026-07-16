import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Customer } from '../customers/entities/customer.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.customerRepo.findOne({
      where: [{ Email: dto.Email }, { Phone: dto.Phone }]
    });
    if (existing) throw new BadRequestException('Email or Phone already exists');

    const hashedPassword = await bcrypt.hash(dto.Password, 10);
    const newCustomer = this.customerRepo.create({
      FullName: dto.FullName,
      Email: dto.Email,
      Phone: dto.Phone,
      Password: hashedPassword,
    });
    const savedCustomer = await this.customerRepo.save(newCustomer);
    
    return {
      message: 'Registered successfully',
      CustomerId: savedCustomer.CustomerId
    };
  }

  async login(dto: LoginDto) {
    const customer = await this.customerRepo.findOne({
      where: [{ Email: dto.Username }, { Phone: dto.Username }]
    });
    if (!customer) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.Password, customer.Password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: customer.CustomerId, email: customer.Email };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  logout() {
    return { message: 'Logged out successfully' };
  }

  async changePassword(customerId: number, dto: ChangePasswordDto) {
    const customer = await this.customerRepo.findOne({ where: { CustomerId: customerId } });
    if (!customer) throw new BadRequestException('Customer not found');

    const isMatch = await bcrypt.compare(dto.OldPassword, customer.Password);
    if (!isMatch) throw new UnauthorizedException('Old password incorrect');

    customer.Password = await bcrypt.hash(dto.NewPassword, 10);
    await this.customerRepo.save(customer);
    
    return { message: 'Password changed successfully' };
  }
}
