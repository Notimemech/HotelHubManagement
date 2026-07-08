import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn()
  PaymentId: number;

  @Column({ type: 'int' })
  BookingId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Amount: number;

  @Column({ type: 'varchar', length: 20 })
  Method: string;

  @Column({ type: 'varchar', length: 20 })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  PaidAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;
}
