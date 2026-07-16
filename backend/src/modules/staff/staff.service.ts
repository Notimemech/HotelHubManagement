import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { StaffInfo } from './entities/staff-info.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountRole } from '../accounts/entities/account-role.entity';
import { AccountsService } from '../accounts/accounts.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffInfo)
    private readonly staffRepo: Repository<StaffInfo>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(AccountRole)
    private readonly accountRoleRepo: Repository<AccountRole>,
    private readonly accountsService: AccountsService,
    private readonly dataSource: DataSource,
  ) {}

  async createStaff(dto: RegisterStaffDto): Promise<StaffInfo> {
    const existing = await this.accountRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already taken');

    return this.dataSource.transaction(async (manager) => {
      const hash = await bcrypt.hash(dto.password, 10);
      const account = await manager.save(
        manager.create(Account, {
          username: dto.username,
          password: hash,
          isActive: true,
        }),
      );
      const staff = await manager.save(
        manager.create(StaffInfo, {
          accountId: account.accountId,
          cccd: dto.cccd,
          fullName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        }),
      );
      await this.accountsService.setRole(account.accountId, dto.role);
      return staff;
    });
  }

  async findAll(): Promise<any[]> {
    const staffList = await this.staffRepo.find({
      relations: { account: { accountRoles: { role: true } } },
    });

    return staffList.map((s) => {
      const roles = s.account?.accountRoles?.map((ar) => ar.role?.roleName) ?? [];
      return {
        staffId: s.staffId,
        accountId: s.accountId,
        cccd: s.cccd,
        fullName: s.fullName,
        phone: s.phone,
        address: s.address,
        birthDate: s.birthDate,
        username: s.account?.username,
        isActive: s.account?.isActive,
        createdAt: s.account?.createdAt,
        roles,
      };
    });
  }

  async findOne(id: string): Promise<any> {
    const s = await this.staffRepo.findOne({
      where: { staffId: id },
      relations: { account: { accountRoles: { role: true } } },
    });
    if (!s) throw new NotFoundException('Staff not found');

    const roles = s.account?.accountRoles?.map((ar) => ar.role?.roleName) ?? [];
    return {
      staffId: s.staffId,
      accountId: s.accountId,
      cccd: s.cccd,
      fullName: s.fullName,
      phone: s.phone,
      address: s.address,
      birthDate: s.birthDate,
      username: s.account?.username,
      isActive: s.account?.isActive,
      createdAt: s.account?.createdAt,
      roles,
    };
  }

  findByAccountId(accountId: string): Promise<StaffInfo | null> {
    return this.staffRepo.findOne({ where: { accountId: accountId } });
  }

  async updateStaff(id: string, dto: UpdateStaffDto): Promise<StaffInfo> {
    const staff = await this.staffRepo.findOne({
      where: { staffId: id },
      relations: { account: true },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.dataSource.transaction(async (manager) => {
      if (dto.fullName !== undefined) staff.fullName = dto.fullName;
      if (dto.phone !== undefined) staff.phone = dto.phone;
      if (dto.address !== undefined) staff.address = dto.address;
      if (dto.birthDate !== undefined) {
        staff.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
      }

      const account = staff.account;
      if (account) {
        if (dto.isActive !== undefined) account.isActive = dto.isActive;
        if (dto.password !== undefined) {
          account.password = await bcrypt.hash(dto.password, 10);
        }
        await manager.save(account);
      }

      return manager.save(staff);
    });
  }

  async changeRole(id: string, roleName: string): Promise<void> {
    const staff = await this.staffRepo.findOne({ where: { staffId: id } });
    if (!staff) throw new NotFoundException('Staff not found');

    await this.dataSource.transaction(async (manager) => {
      const arRepo = manager.getRepository(AccountRole);
      // Delete old roles
      await arRepo.delete({ accountId: staff.accountId });
      // Add new role
      await this.accountsService.setRole(staff.accountId, roleName);
    });
  }
}