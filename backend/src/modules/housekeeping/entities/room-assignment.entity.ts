import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';

@Entity('RoomAssignments')
export class RoomAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignmentId!: string;

  @Column({ name: 'RoomID', type: 'uniqueidentifier' })
  roomId!: string;

  @Column({ name: 'CleanerId', type: 'uniqueidentifier' })
  cleanerId!: string;

  @Column({ name: 'AssignedBy', type: 'uniqueidentifier' })
  assignedBy!: string;

  @CreateDateColumn({ name: 'AssignedAt', type: 'datetime' })
  assignedAt!: Date;

  @ManyToOne(() => Room, (room) => room.checklistLogs)
  @JoinColumn({ name: 'RoomID' })
  room?: Room;

  @ManyToOne(() => StaffInfo, (s) => s.checklistLogs)
  @JoinColumn({ name: 'CleanerId' })
  cleaner?: StaffInfo;
}
