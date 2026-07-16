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
  @PrimaryGeneratedColumn()
  BookingId: number;

  @Column({ type: 'int' })
  CustomerId: number;

  @CreateDateColumn({ type: 'datetime' })
  BookingDate: Date;

  @Column({ type: 'int', default: 1 })
  CurrentVersion: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  TotalPrice: number;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  Status: string;

  @Column({ type: 'bit', default: 0 })
  IsDeleted: boolean;

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
