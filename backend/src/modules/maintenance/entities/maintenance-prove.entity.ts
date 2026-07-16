import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IssueReport } from './issue-report.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';

@Entity('MaintenanceProves')
export class MaintenanceProve {
  @PrimaryGeneratedColumn('uuid', { name: 'ProveId' })
  proveId!: string;

  @Column({ name: 'IssueId', type: 'uniqueidentifier' })
  issueId!: string;

  @Column({ name: 'MaintainerId', type: 'uniqueidentifier' })
  maintainerId!: string;

  @Column({ name: 'FinishImage', type: 'nvarchar', length: 'MAX', nullable: true })
  finishImage!: string;

  @Column({ name: 'FinishVideo', type: 'nvarchar', length: 'MAX', nullable: true })
  finishVideo!: string;

  @CreateDateColumn({ name: 'ResolvedAt', type: 'datetime' })
  resolvedAt!: Date;

  @ManyToOne(() => IssueReport, (issue) => issue.proves)
  @JoinColumn({ name: 'IssueId' })
  issue: IssueReport;

  @ManyToOne(() => StaffInfo, (staff) => staff.maintenanceProves)
  @JoinColumn({ name: 'MaintainerId' })
  maintainer: StaffInfo;
}
