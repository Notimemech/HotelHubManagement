import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
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

  @Column({ name: 'Role', type: 'nvarchar', length: 50, default: 'User' })
  role!: string;

  @OneToOne(() => Customer, (customer) => customer.account)
  customer?: Customer;

  @OneToOne(() => StaffInfo, (staff) => staff.account)
  staff?: StaffInfo;
}
