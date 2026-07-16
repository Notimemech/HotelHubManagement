import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Role } from './entities/role.entity';
import { AccountRole } from './entities/account-role.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(AccountRole)
    private readonly accountRoleRepo: Repository<AccountRole>,
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

  async getRoles(accountId: string): Promise<Role[]> {
    const links = await this.accountRoleRepo.find({
      where: { accountId: accountId },
      relations: { role: true },
    });
    return links.map((l) => l.role);
  }

  async setRole(accountId: string, roleName: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { roleName: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} not found`);
    const exists = await this.accountRoleRepo.findOne({
      where: { accountId: accountId, roleId: role.roleId },
    });
    if (exists) return;
    await this.accountRoleRepo.save(
      this.accountRoleRepo.create({
        accountId: accountId,
        roleId: role.roleId,
      }),
    );
  }
}
