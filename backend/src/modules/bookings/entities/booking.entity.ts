import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { BookingVersion } from './booking-version.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { BookingService } from '../../services/entities/booking-service.entity';

@Entity('Bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid', { name: 'BookingId' })
  bookingId!: string;

  @Column({ name: 'CustomerId', type: 'uniqueidentifier' })
  customerId!: string;

  @CreateDateColumn({ name: 'BookingDate', type: 'datetime' })
  bookingDate!: Date;

  @Column({ name: 'CurrentVersion', type: 'int', default: 1 })
  currentVersion!: number;

  @Column({
    name: 'TotalPrice',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  totalPrice!: number;

  @Column({
    name: 'Status',
    type: 'varchar',
    length: 20,
    default: 'Pending',
  })
  status!: string;

  @Column({ name: 'IsDeleted', type: 'bit', default: 0 })
  isDeleted!: boolean;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'CustomerId' })
  customer: Customer;

  @OneToMany(() => BookingVersion, (v) => v.booking)
  versions: BookingVersion[];

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(() => BookingService, (service) => service.booking)
  services: BookingService[];
}
