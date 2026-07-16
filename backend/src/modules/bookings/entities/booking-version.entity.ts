import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './booking.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';
import { BookingDetail } from './booking-detail.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('BookingVersions')
export class BookingVersion {
  @PrimaryGeneratedColumn()
  VersionId: number;

  @Column({ type: 'int' })
  BookingId: number;

  @Column({ type: 'int' })
  VersionNumber: number;

  // Snapshot of booking date/guests at this version.
  @Column({ type: 'date', nullable: true })
  CheckIn: Date;

  @Column({ type: 'date', nullable: true })
  CheckOut: Date;

  @Column({ type: 'int', nullable: true })
  Adults: number;

  @Column({ type: 'int', nullable: true })
  Children: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  SpecialRequest: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  TotalAmountAtThisVersion: number;

  @Column({ type: 'int', nullable: true })
  StaffInCharge: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  ChangeReason: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  RequestEvidenceImage: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @ManyToOne(() => Booking, (b) => b.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => StaffInfo, (s) => s.versionsInCharge, { nullable: true })
  @JoinColumn({ name: 'StaffInCharge' })
  staffInCharge: StaffInfo;

  @OneToMany(() => BookingDetail, (d) => d.version)
  details: BookingDetail[];

  @OneToMany(() => Payment, (p) => p.version)
  payments: Payment[];
}
