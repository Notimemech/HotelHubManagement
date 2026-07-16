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
  @PrimaryGeneratedColumn()
  CustomerId: number;

  @Column({ type: 'int', unique: true })
  AccountId: number;

  @Column({ type: 'nvarchar', length: 100 })
  FullName: string;

  @Column({ type: 'nvarchar', length: 100, unique: true, nullable: true })
  Email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  Phone: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Avatar: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @OneToOne(() => Account, (account) => account.customer)
  @JoinColumn({ name: 'AccountId' })
  account: Account;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @OneToMany(() => CustomerBankAccount, (bank) => bank.customer)
  bankAccounts: CustomerBankAccount[];
}
