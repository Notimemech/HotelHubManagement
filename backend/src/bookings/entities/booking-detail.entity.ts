import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('BookingDetails')
export class BookingDetail {
  @PrimaryGeneratedColumn()
  BookingDetailId: number;

  @Column({ type: 'int' })
  BookingId: number;

  @Column({ type: 'int' })
  RoomId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Price: number;

  @Column({ type: 'int' })
  Nights: number;

  @ManyToOne(() => Booking, (booking) => booking.details)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => Room, (room) => room.bookingDetails)
  @JoinColumn({ name: 'RoomId' })
  room: Room;
}
