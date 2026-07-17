import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { IssueReport } from './issue-report.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';

@Entity('IssueAssignments')
export class IssueAssignment {
  @PrimaryGeneratedColumn('uuid')
  assignmentId!: string;

  @Column({ name: 'IssueId', type: 'uniqueidentifier' })
  issueId!: string;

  @Column({ name: 'MaintainerId', type: 'uniqueidentifier' })
  maintainerId!: string;

  @Column({ name: 'AssignedBy', type: 'uniqueidentifier' })
  assignedBy!: string;

  @CreateDateColumn({ name: 'AssignedAt', type: 'datetime' })
  assignedAt!: Date;

  @ManyToOne(() => IssueReport, (issue) => issue.proves)
  @JoinColumn({ name: 'IssueId' })
  issue?: IssueReport;

  @ManyToOne(() => StaffInfo, (s) => s.maintenanceProves)
  @JoinColumn({ name: 'MaintainerId' })
  maintainer?: StaffInfo;
}
