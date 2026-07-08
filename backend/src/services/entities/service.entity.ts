import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BookingService } from './booking-service.entity';

@Entity('Services')
export class Service {
  @PrimaryGeneratedColumn()
  ServiceId: number;

  @Column({ type: 'nvarchar', length: 100 })
  ServiceName: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Price: number;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingServices: BookingService[];
}
