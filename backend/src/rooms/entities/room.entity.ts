import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoomType } from './room-type.entity';
import { BookingDetail } from '../../bookings/entities/booking-detail.entity';

@Entity('Rooms')
export class Room {
  @PrimaryGeneratedColumn({ name: 'RoomID' })
  RoomId: number;

  @Column({ name: 'RoomCode', type: 'varchar', length: 10, unique: true })
  RoomCode: string;

  @Column({ name: 'TypeID', type: 'int' })
  TypeID: number;

  @Column({ name: 'Floor', type: 'int', nullable: true })
  Floor: number;

  @Column({ name: 'Status', type: 'varchar', length: 20 })
  Status: string;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms)
  @JoinColumn({ name: 'TypeID' })
  roomType: RoomType;

  @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.room)
  bookingDetails: BookingDetail[];
}
