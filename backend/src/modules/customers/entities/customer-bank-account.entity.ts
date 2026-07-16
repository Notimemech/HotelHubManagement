import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('CustomerBankAccounts')
export class CustomerBankAccount {
  @PrimaryGeneratedColumn()
  BankId: number;

  @Column({ type: 'int' })
  CustomerId: number;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  BankName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  AccountNumber: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  AccountHolderName: string;

  @Column({ type: 'bit', default: 0 })
  IsDefault: boolean;

  @ManyToOne(() => Customer, (customer) => customer.bankAccounts)
  @JoinColumn({ name: 'CustomerId' })
  customer: Customer;
}
