import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Account } from '../accounts/entities/account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { AccountsService } from '../accounts/accounts.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.accountRepo.findOne({
      where: { Username: dto.Username },
    });
    if (existing) throw new ConflictException('Username already taken');

    const hash = await bcrypt.hash(dto.Password, 10);
    const account = await this.accountsService.create(dto.Username, hash);
    await this.accountsService.setRole(account.AccountId, 'User');

    const customer = await this.customerRepo.save(
      this.customerRepo.create({
        AccountId: account.AccountId,
        FullName: dto.FullName,
        Email: dto.Email,
        Phone: dto.Phone,
      }),
    );

    return {
      message: 'Registered successfully',
      CustomerId: customer.CustomerId,
    };
  }

  async login(dto: LoginDto) {
    const account = await this.accountRepo.findOne({
      where: { Username: dto.Username },
    });
    if (!account || !account.IsActive)
      throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.Password, account.Password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const roles = await this.accountsService.getRoles(account.AccountId);
    const role = roles[0]?.RoleName ?? 'User';

    const payload = {
      sub: account.AccountId,
      username: account.Username,
      role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  logout() {
    return { message: 'Logged out successfully' };
  }

  async changePassword(accountId: number, dto: ChangePasswordDto) {
    const account = await this.accountRepo.findOne({
      where: { AccountId: accountId },
    });
    if (!account) throw new BadRequestException('Account not found');

    const isMatch = await bcrypt.compare(dto.OldPassword, account.Password);
    if (!isMatch) throw new UnauthorizedException('Old password incorrect');

    account.Password = await bcrypt.hash(dto.NewPassword, 10);
    await this.accountRepo.save(account);
    return { message: 'Password changed successfully' };
  }
}
