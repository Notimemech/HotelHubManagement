import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { BookingDetail } from './booking-detail.entity';
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

  @Column({ type: 'date' })
  CheckIn: Date;

  @Column({ type: 'date' })
  CheckOut: Date;

  @Column({ type: 'int' })
  Adults: number;

  @Column({ type: 'int' })
  Children: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  TotalPrice: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  SpecialRequest: string;

  @Column({ type: 'varchar', length: 20 })
  Status: string;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'CustomerId' })
  customer: Customer;

  @OneToMany(() => BookingDetail, (detail) => detail.booking)
  details: BookingDetail[];

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(() => BookingService, (service) => service.booking)
  services: BookingService[];
}
