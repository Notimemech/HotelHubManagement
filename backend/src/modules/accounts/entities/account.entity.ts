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
  @PrimaryGeneratedColumn()
  AccountId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  Username: string;

  @Column({ type: 'varchar', length: 255 })
  Password: string;

  @Column({ type: 'bit', default: 1 })
  IsActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @OneToMany(() => AccountRole, (accountRole) => accountRole.account)
  accountRoles: AccountRole[];

  @OneToMany(() => Customer, (customer) => customer.account)
  customer?: Customer;

  @OneToMany(() => StaffInfo, (staff) => staff.account)
  staff?: StaffInfo;
}
