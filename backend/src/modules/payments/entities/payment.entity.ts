import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingVersion } from '../../bookings/entities/booking-version.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn()
  PaymentId: number;

  @Column({ type: 'int' })
  VersionId: number;

  @Column({ type: 'int' })
  BookingId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Amount: number;

  @Column({ type: 'varchar', length: 20 })
  Method: string;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  Status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ExternalTransactionID: string;

  @Column({ type: 'datetime', nullable: true })
  PaidAt: Date;

  @ManyToOne(() => BookingVersion, (v) => v.payments)
  @JoinColumn({ name: 'VersionId' })
  version: BookingVersion;

  @ManyToOne(() => Booking, (b) => b.payments)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;
}
