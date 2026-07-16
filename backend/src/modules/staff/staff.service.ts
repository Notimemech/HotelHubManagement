import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { StaffInfo } from './entities/staff-info.entity';
import { Account } from '../accounts/entities/account.entity';
import { isValidRole } from '../accounts/roles.constants';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffInfo)
    private readonly staffRepo: Repository<StaffInfo>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  async createStaff(dto: RegisterStaffDto): Promise<StaffInfo> {
    if (!isValidRole(dto.role)) {
      throw new ConflictException(`Role ${dto.role} not allowed`);
    }
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
          role: dto.role,
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
      return staff;
    });
  }

  async findAll(): Promise<any[]> {
    const staffList = await this.staffRepo.find({
      relations: { account: true },
    });

    return staffList.map((s) => ({
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
      role: s.account?.role ?? 'User',
    }));
  }

  async findOne(id: string): Promise<any> {
    const s = await this.staffRepo.findOne({
      where: { staffId: id },
      relations: { account: true },
    });
    if (!s) throw new NotFoundException('Staff not found');

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
      role: s.account?.role ?? 'User',
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
    if (!isValidRole(roleName)) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }
    const staff = await this.staffRepo.findOne({ where: { staffId: id } });
    if (!staff) throw new NotFoundException('Staff not found');

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Account, { accountId: staff.accountId }, { role: roleName });
    });
  }
}
