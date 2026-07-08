import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async getProfile(customerId: number) {
    const customer = await this.customerRepo.findOne({ where: { CustomerId: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const { Password, ...result } = customer;
    return result;
  }

  async updateProfile(customerId: number, dto: UpdateProfileDto) {
    const customer = await this.customerRepo.findOne({ where: { CustomerId: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');
    
    if (dto.FullName) customer.FullName = dto.FullName;
    if (dto.Avatar) customer.Avatar = dto.Avatar;
    
    await this.customerRepo.save(customer);
    const { Password, ...result } = customer;
    return result;
  }
}
