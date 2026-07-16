import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { CustomerBankAccount } from './customer-bank-account.entity';

@Entity('Customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid', { name: 'CustomerId' })
  customerId!: string;

  @Column({ name: 'AccountId', type: 'uniqueidentifier', unique: true })
  accountId!: string;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName!: string;

  @Column({
    name: 'Email',
    type: 'nvarchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  email!: string;

  @Column({
    name: 'Phone',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
  })
  phone!: string;

  @Column({ name: 'Avatar', type: 'nvarchar', length: 255, nullable: true })
  avatar!: string;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt!: Date;

  @OneToOne(() => Account, (account) => account.customer)
  @JoinColumn({ name: 'AccountId' })
  account: Account;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @OneToMany(() => CustomerBankAccount, (bank) => bank.customer)
  bankAccounts: CustomerBankAccount[];
}
