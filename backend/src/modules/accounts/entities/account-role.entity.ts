import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { Role } from './role.entity';

@Entity('AccountRoles')
export class AccountRole {
  @PrimaryColumn({ name: 'AccountId', type: 'uuid' })
  accountId!: string;

  @PrimaryColumn({ name: 'RoleId', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Account, (account) => account.accountRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'AccountId' })
  account: Account;

  @ManyToOne(() => Role, (role) => role.accountRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'RoleId' })
  role: Role;
}
