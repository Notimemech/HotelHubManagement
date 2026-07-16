import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RoomType } from './room-type.entity';
import { BookingDetail } from '../../bookings/entities/booking-detail.entity';
import { ChecklistLog } from '../../housekeeping/entities/checklist-log.entity';
import { IssueReport } from '../../maintenance/entities/issue-report.entity';

@Entity('Rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid', { name: 'RoomID' })
  roomId!: string;

  @Column({ name: 'RoomCode', type: 'varchar', length: 10, unique: true })
  roomCode!: string;

  @Column({ name: 'TypeID', type: 'uniqueidentifier' })
  typeId!: string;

  @Column({ name: 'Floor', type: 'int', nullable: true })
  floor!: number;

  @Column({ name: 'Status', type: 'varchar', length: 20 })
  status!: string;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms)
  @JoinColumn({ name: 'TypeID' })
  roomType: RoomType;

  @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.room)
  bookingDetails!: BookingDetail[];

  @OneToMany(() => ChecklistLog, (log) => log.room)
  checklistLogs!: ChecklistLog[];

  @OneToMany(() => IssueReport, (issue) => issue.room)
  issueReports!: IssueReport[];
}
