import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Role } from './entities/role.entity';
import { AccountRole } from './entities/account-role.entity';
import { AccountsService } from './accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Role, AccountRole])],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
