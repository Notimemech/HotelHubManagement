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
  @PrimaryGeneratedColumn('uuid', { name: 'PaymentId' })
  paymentId!: string;

  @Column({ name: 'VersionId', type: 'uniqueidentifier' })
  versionId!: string;

  @Column({ name: 'BookingId', type: 'uniqueidentifier' })
  bookingId!: string;

  @Column({ name: 'Amount', type: 'decimal', precision: 18, scale: 2 })
  amount!: number;

  @Column({ name: 'Method', type: 'varchar', length: 20 })
  method!: string;

  @Column({
    name: 'Status',
    type: 'varchar',
    length: 20,
    default: 'Pending',
  })
  status!: string;

  @Column({ name: 'ExternalTransactionID', type: 'varchar', length: 100, nullable: true })
  externalTransactionId!: string;

  @Column({ name: 'PaidAt', type: 'datetime', nullable: true })
  paidAt!: Date;

  @ManyToOne(() => BookingVersion, (v) => v.payments)
  @JoinColumn({ name: 'VersionId' })
  version: BookingVersion;

  @ManyToOne(() => Booking, (b) => b.payments)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;
}
