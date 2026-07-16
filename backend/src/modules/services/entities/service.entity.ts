import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BookingService } from './booking-service.entity';

@Entity('Services')
export class Service {
  @PrimaryGeneratedColumn('uuid', { name: 'ServiceId' })
  serviceId!: string;

  @Column({ name: 'ServiceName', type: 'nvarchar', length: 100 })
  serviceName!: string;

  @Column({ name: 'Price', type: 'decimal', precision: 18, scale: 2 })
  price!: number;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingServices: BookingService[];
}
