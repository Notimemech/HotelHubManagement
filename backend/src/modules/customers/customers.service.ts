import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerBankAccount } from './entities/customer-bank-account.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(CustomerBankAccount)
    private readonly bankRepo: Repository<CustomerBankAccount>,
  ) {}

  private async findCustomerByAccountId(accountId: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { accountId: accountId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getProfile(accountId: string) {
    const customer = await this.findCustomerByAccountId(accountId);
    return customer;
  }

  async updateProfile(accountId: string, dto: UpdateProfileDto) {
    const customer = await this.findCustomerByAccountId(accountId);
    if (dto.fullName) customer.fullName = dto.fullName;
    if (dto.avatar) customer.avatar = dto.avatar;
    return this.customerRepo.save(customer);
  }

  listBankAccounts(accountId: string): Promise<CustomerBankAccount[]> {
    return this.findCustomerByAccountId(accountId).then((c) =>
      this.bankRepo.find({ where: { customerId: c.customerId } }),
    );
  }

  addBankAccount(
    accountId: string,
    dto: Omit<CustomerBankAccount, 'bankId' | 'customerId'>,
  ): Promise<CustomerBankAccount> {
    return this.findCustomerByAccountId(accountId).then((c) =>
      this.bankRepo.save(
        this.bankRepo.create({ ...dto, customerId: c.customerId }),
      ),
    );
  }
}
