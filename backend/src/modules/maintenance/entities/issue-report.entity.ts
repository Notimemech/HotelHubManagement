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
  @PrimaryGeneratedColumn()
  IssueId: number;

  @Column({ type: 'int' })
  RoomID: number;

  @Column({ type: 'int' })
  ReporterId: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  Description: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  IssueImage: string;

  @Column({ type: 'nvarchar', length: 50, default: 'Pending' })
  Status: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @ManyToOne(() => Room, (room) => room.issueReports)
  @JoinColumn({ name: 'RoomID' })
  room: Room;

  @ManyToOne(() => StaffInfo, (staff) => staff.reportedIssues)
  @JoinColumn({ name: 'ReporterId' })
  reporter: StaffInfo;

  @OneToMany(() => MaintenanceProve, (p) => p.issue)
  proves: MaintenanceProve[];
}
