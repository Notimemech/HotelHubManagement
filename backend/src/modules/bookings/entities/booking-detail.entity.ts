import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingVersion } from './booking-version.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('BookingDetails')
export class BookingDetail {
  @PrimaryGeneratedColumn()
  BookingDetailId!: number;

  @Column({ type: 'int' })
  VersionId!: number;

  @Column({ type: 'int' })
  RoomId!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  Price!: number;

  @Column({ type: 'int' })
  Nights!: number;

  @ManyToOne(() => BookingVersion, (v) => v.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'VersionId' })
  version!: BookingVersion;

  @ManyToOne(() => Room, (room) => room.bookingDetails)
  @JoinColumn({ name: 'RoomId' })
  room!: Room;
}
