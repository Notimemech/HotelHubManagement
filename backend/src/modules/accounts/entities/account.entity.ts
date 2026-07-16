import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { AccountRole } from './account-role.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';

@Entity('Accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'AccountId' })
  accountId!: string;

  @Column({ name: 'Username', type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ name: 'Password', type: 'varchar', length: 255 })
  password!: string;

  @Column({ name: 'IsActive', type: 'bit', default: 1 })
  isActive!: boolean;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt!: Date;

  @OneToMany(() => AccountRole, (accountRole) => accountRole.account)
  accountRoles: AccountRole[];

  @OneToMany(() => Customer, (customer) => customer.account)
  customer?: Customer;

  @OneToMany(() => StaffInfo, (staff) => staff.account)
  staff?: StaffInfo;
}
