import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Service } from './service.entity';

@Entity('BookingServices')
export class BookingService {
  @PrimaryGeneratedColumn()
  BookingServiceId: number;

  @Column({ type: 'int' })
  BookingId: number;

  @Column({ type: 'int' })
  ServiceId: number;

  @Column({ type: 'int' })
  Quantity: number;

  @ManyToOne(() => Booking, (booking) => booking.services)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.bookingServices)
  @JoinColumn({ name: 'ServiceId' })
  service: Service;
}
