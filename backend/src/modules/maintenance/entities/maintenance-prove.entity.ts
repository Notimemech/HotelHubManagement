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
  @PrimaryGeneratedColumn()
  ProveId: number;

  @Column({ type: 'int' })
  IssueId: number;

  @Column({ type: 'int' })
  MaintainerId: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  FinishImage: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  FinishVideo: string;

  @CreateDateColumn({ type: 'datetime' })
  ResolvedAt: Date;

  @ManyToOne(() => IssueReport, (issue) => issue.proves)
  @JoinColumn({ name: 'IssueId' })
  issue: IssueReport;

  @ManyToOne(() => StaffInfo, (staff) => staff.maintenanceProves)
  @JoinColumn({ name: 'MaintainerId' })
  maintainer: StaffInfo;
}
