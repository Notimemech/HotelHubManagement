import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('Customers')
export class Customer {
  @PrimaryGeneratedColumn()
  CustomerId: number;

  @Column({ type: 'nvarchar', length: 100 })
  FullName: string;

  @Column({ type: 'nvarchar', length: 100, unique: true, nullable: true })
  Email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  Phone: string;

  @Column({ type: 'nvarchar', length: 255 })
  Password: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Avatar: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];
}
