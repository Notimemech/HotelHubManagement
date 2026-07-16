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
      where: { Username: dto.Username },
    });
    if (existing) throw new ConflictException('Username already taken');

    return this.dataSource.transaction(async (manager) => {
      const hash = await bcrypt.hash(dto.Password, 10);
      const account = await manager.save(
        manager.create(Account, {
          Username: dto.Username,
          Password: hash,
          IsActive: true,
        }),
      );
      const staff = await manager.save(
        manager.create(StaffInfo, {
          AccountId: account.AccountId,
          CCCD: dto.CCCD,
          FullName: dto.FullName,
          Phone: dto.Phone,
          Address: dto.Address,
          BirthDate: dto.BirthDate ? new Date(dto.BirthDate) : undefined,
        }),
      );
      await this.accountsService.setRole(account.AccountId, dto.Role);
      return staff;
    });
  }

  findByAccountId(accountId: number): Promise<StaffInfo | null> {
    return this.staffRepo.findOne({ where: { AccountId: accountId } });
  }
}
