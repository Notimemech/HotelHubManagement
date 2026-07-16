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
  @PrimaryGeneratedColumn('uuid', { name: 'BookingDetailId' })
  bookingDetailId!: string;

  @Column({ name: 'VersionId', type: 'uniqueidentifier' })
  versionId!: string;

  @Column({ name: 'RoomId', type: 'uniqueidentifier' })
  roomId!: string;

  @Column({ name: 'Price', type: 'decimal', precision: 18, scale: 2 })
  price!: number;

  @Column({ name: 'Nights', type: 'int' })
  nights!: number;

  @ManyToOne(() => BookingVersion, (v) => v.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'VersionId' })
  version!: BookingVersion;

  @ManyToOne(() => Room, (room) => room.bookingDetails)
  @JoinColumn({ name: 'RoomId' })
  room!: Room;
}
