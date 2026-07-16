import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { isValidRole } from './roles.constants';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  create(username: string, passwordHash: string): Promise<Account> {
    const acc = this.accountRepo.create({
      username: username,
      password: passwordHash,
      isActive: true,
    });
    return this.accountRepo.save(acc);
  }

  findByUsername(username: string): Promise<Account | null> {
    return this.accountRepo.findOne({ where: { username: username } });
  }

  findById(id: string): Promise<Account | null> {
    return this.accountRepo.findOne({ where: { accountId: id } });
  }

  async getRoles(accountId: string): Promise<string[]> {
    const account = await this.accountRepo.findOne({
      where: { accountId: accountId },
    });
    if (!account) return [];
    return [account.role ?? 'User'];
  }

  async setRole(accountId: string, roleName: string): Promise<void> {
    if (!isValidRole(roleName)) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }
    await this.accountRepo.update({ accountId }, { role: roleName });
  }
}
