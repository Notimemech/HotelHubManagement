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
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already taken');

    const hash = await bcrypt.hash(dto.password, 10);
    const account = await this.accountsService.create(dto.username, hash);
    await this.accountsService.setRole(account.accountId, 'User');

    const customer = await this.customerRepo.save(
      this.customerRepo.create({
        accountId: account.accountId,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
      }),
    );

    return {
      message: 'Registered successfully',
      customerId: customer.customerId,
    };
  }

  async login(dto: LoginDto) {
    const account = await this.accountRepo.findOne({
      where: { username: dto.username },
    });
    if (!account || !account.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, account.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const roles = await this.accountsService.getRoles(account.accountId);
    const role = roles[0]?.roleName ?? 'User';

    const payload = {
      sub: account.accountId,
      username: account.username,
      role,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  logout() {
    return { message: 'Logged out successfully' };
  }

  async changePassword(accountId: string, dto: ChangePasswordDto) {
    const account = await this.accountRepo.findOne({
      where: { accountId: accountId },
    });
    if (!account) throw new BadRequestException('Account not found');

    const isMatch = await bcrypt.compare(dto.oldPassword, account.password);
    if (!isMatch) throw new UnauthorizedException('Old password incorrect');

    account.password = await bcrypt.hash(dto.newPassword, 10);
    await this.accountRepo.save(account);
    return { message: 'Password changed successfully' };
  }
}
