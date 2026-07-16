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
      Username: username,
      Password: passwordHash,
      IsActive: true,
    });
    return this.accountRepo.save(acc);
  }

  findByUsername(username: string): Promise<Account | null> {
    return this.accountRepo.findOne({ where: { Username: username } });
  }

  findById(id: number): Promise<Account | null> {
    return this.accountRepo.findOne({ where: { AccountId: id } });
  }

  async getRoles(accountId: number): Promise<Role[]> {
    const links = await this.accountRoleRepo.find({
      where: { AccountId: accountId },
      relations: { role: true },
    });
    return links.map((l) => l.role);
  }

  async setRole(accountId: number, roleName: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { RoleName: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} not found`);
    const exists = await this.accountRoleRepo.findOne({
      where: { AccountId: accountId, RoleId: role.RoleId },
    });
    if (exists) return;
    await this.accountRoleRepo.save(
      this.accountRoleRepo.create({
        AccountId: accountId,
        RoleId: role.RoleId,
      }),
    );
  }
}
