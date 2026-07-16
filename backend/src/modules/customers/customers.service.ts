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

  private async findCustomerByAccountId(accountId: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { AccountId: accountId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async getProfile(accountId: number) {
    const customer = await this.findCustomerByAccountId(accountId);
    return customer;
  }

  async updateProfile(accountId: number, dto: UpdateProfileDto) {
    const customer = await this.findCustomerByAccountId(accountId);
    if (dto.FullName) customer.FullName = dto.FullName;
    if (dto.Avatar) customer.Avatar = dto.Avatar;
    return this.customerRepo.save(customer);
  }

  listBankAccounts(accountId: number): Promise<CustomerBankAccount[]> {
    return this.findCustomerByAccountId(accountId).then((c) =>
      this.bankRepo.find({ where: { CustomerId: c.CustomerId } }),
    );
  }

  addBankAccount(
    accountId: number,
    dto: Omit<CustomerBankAccount, 'BankId' | 'CustomerId'>,
  ): Promise<CustomerBankAccount> {
    return this.findCustomerByAccountId(accountId).then((c) =>
      this.bankRepo.save(
        this.bankRepo.create({ ...dto, CustomerId: c.CustomerId }),
      ),
    );
  }
}
