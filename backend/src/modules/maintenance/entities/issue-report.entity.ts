import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';
import { MaintenanceProve } from './maintenance-prove.entity';

@Entity('IssueReports')
export class IssueReport {
  @PrimaryGeneratedColumn('uuid', { name: 'IssueId' })
  issueId!: string;

  @Column({ name: 'RoomID', type: 'uniqueidentifier' })
  roomId!: string;

  @Column({ name: 'ReporterId', type: 'uniqueidentifier' })
  reporterId!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  description!: string;

  @Column({ name: 'IssueImage', type: 'nvarchar', length: 'MAX', nullable: true })
  issueImage!: string;

  @Column({ name: 'Status', type: 'nvarchar', length: 50, default: 'Pending' })
  status!: string;

  @CreateDateColumn({ name: 'CreatedAt', type: 'datetime' })
  createdAt!: Date;

  @ManyToOne(() => Room, (room) => room.issueReports)
  @JoinColumn({ name: 'RoomID' })
  room: Room;

  @ManyToOne(() => StaffInfo, (staff) => staff.reportedIssues)
  @JoinColumn({ name: 'ReporterId' })
  reporter: StaffInfo;

  @OneToMany(() => MaintenanceProve, (p) => p.issue)
  proves: MaintenanceProve[];
}
