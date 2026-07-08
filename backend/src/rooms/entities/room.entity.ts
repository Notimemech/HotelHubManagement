import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoomType } from './room-type.entity';
import { BookingDetail } from '../../bookings/entities/booking-detail.entity';

@Entity('Rooms')
export class Room {
  @PrimaryGeneratedColumn()
  RoomId: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  RoomNumber: string;

  @Column({ type: 'int' })
  RoomTypeId: number;

  @Column({ type: 'int', nullable: true })
  Floor: number;

  @Column({ type: 'varchar', length: 20 })
  Status: string;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms)
  @JoinColumn({ name: 'RoomTypeId' })
  roomType: RoomType;

  @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.room)
  bookingDetails: BookingDetail[];
}
