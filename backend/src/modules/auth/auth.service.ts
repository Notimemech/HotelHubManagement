import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Account } from '../accounts/entities/account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AccountsService } from '../accounts/accounts.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
  ) {}

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }

  async signAccessToken(account: Account, role: string): Promise<string> {
    const payload = {
      sub: account.accountId,
      username: account.username,
      role,
    };
    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }

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

    const accessToken = await this.signAccessToken(account, role);
    const rawRefreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        accountId: account.accountId,
        tokenHash,
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const record = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
    });
    if (!record) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (new Date() > record.expiresAt) {
      await this.refreshTokenRepo.remove(record);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const account = await this.accountRepo.findOne({
      where: { accountId: record.accountId },
    });
    if (!account || !account.isActive) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    await this.refreshTokenRepo.remove(record);

    const roles = await this.accountsService.getRoles(account.accountId);
    const role = roles[0]?.roleName ?? 'User';

    const newAccessToken = await this.signAccessToken(account, role);
    const newRawRefreshToken = this.generateRefreshToken();
    const newTokenHash = this.hashToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        accountId: account.accountId,
        tokenHash: newTokenHash,
        expiresAt,
      }),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const record = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
    });
    if (record) {
      await this.refreshTokenRepo.remove(record);
    }
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
