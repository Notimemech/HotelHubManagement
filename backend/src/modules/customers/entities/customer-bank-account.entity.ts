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
  @PrimaryGeneratedColumn('uuid', { name: 'BankId' })
  bankId!: string;

  @Column({ name: 'CustomerId', type: 'uniqueidentifier' })
  customerId!: string;

  @Column({ name: 'BankName', type: 'nvarchar', length: 100, nullable: true })
  bankName!: string;

  @Column({
    name: 'AccountNumber',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  accountNumber!: string;

  @Column({
    name: 'AccountHolderName',
    type: 'nvarchar',
    length: 100,
    nullable: true,
  })
  accountHolderName!: string;

  @Column({ name: 'IsDefault', type: 'bit', default: 0 })
  isDefault!: boolean;

  @ManyToOne(() => Customer, (customer) => customer.bankAccounts)
  @JoinColumn({ name: 'CustomerId' })
  customer!: Customer;
}
