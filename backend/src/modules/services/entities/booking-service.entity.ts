import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Service } from './service.entity';

@Entity('BookingServices')
export class BookingService {
  @PrimaryGeneratedColumn('uuid', { name: 'BookingServiceId' })
  bookingServiceId!: string;

  @Column({ name: 'BookingId', type: 'uniqueidentifier' })
  bookingId!: string;

  @Column({ name: 'ServiceId', type: 'uniqueidentifier' })
  serviceId!: string;

  @Column({ name: 'Quantity', type: 'int' })
  quantity!: number;

  @ManyToOne(() => Booking, (booking) => booking.services)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.bookingServices)
  @JoinColumn({ name: 'ServiceId' })
  service: Service;
}
