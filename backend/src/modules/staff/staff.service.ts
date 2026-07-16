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
import { AccountsService } from '../accounts/accounts.service';
import { RegisterStaffDto } from './dto/register-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffInfo)
    private readonly staffRepo: Repository<StaffInfo>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
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

  findByAccountId(accountId: string): Promise<StaffInfo | null> {
    return this.staffRepo.findOne({ where: { accountId: accountId } });
  }
}
