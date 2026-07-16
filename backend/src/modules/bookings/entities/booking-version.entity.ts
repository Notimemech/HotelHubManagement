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
  @PrimaryGeneratedColumn('uuid', { name: 'VersionId' })
  versionId!: string;

  @Column({ name: 'BookingId', type: 'uniqueidentifier' })
  bookingId!: string;

  @Column({ name: 'VersionNumber', type: 'int' })
  versionNumber!: number;

  // Snapshot of booking date/guests at this version.
  @Column({ name: 'CheckIn', type: 'date', nullable: true })
  checkIn!: Date;

  @Column({ name: 'CheckOut', type: 'date', nullable: true })
  checkOut!: Date;

  @Column({ name: 'Adults', type: 'int', nullable: true })
  adults!: number;

  @Column({ name: 'Children', type: 'int', nullable: true })
  children!: number;

  @Column({
    name: 'SpecialRequest',
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  specialRequest!: string;

  @Column({
    name: 'TotalAmountAtThisVersion',
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  totalAmountAtThisVersion!: number;

  @Column({
    name: 'StaffInCharge',
    type: 'uniqueidentifier',
    nullable: true,
  })
  staffInChargeId!: string;

  @Column({ name: 'ChangeReason', type: 'nvarchar', length: 'MAX', nullable: true })
  changeReason!: string;

  @Column({
    name: 'RequestEvidenceImage',
    type: 'nvarchar',
    length: 'MAX',
    nullable: true,
  })
  requestEvidenceImage!: string;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt!: Date;

  @ManyToOne(() => Booking, (b) => b.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => StaffInfo, (s) => s.versionsInCharge, { nullable: true })
  @JoinColumn({ name: 'StaffInCharge' })
  staffInCharge?: StaffInfo;

  @OneToMany(() => BookingDetail, (d) => d.version)
  details: BookingDetail[];

  @OneToMany(() => Payment, (p) => p.version)
  payments: Payment[];
}
