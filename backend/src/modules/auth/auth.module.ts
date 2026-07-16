import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Account } from '../accounts/entities/account.entity';
import { Customer } from '../customers/entities/customer.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Customer, RefreshToken]),
    AccountsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'my-super-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
