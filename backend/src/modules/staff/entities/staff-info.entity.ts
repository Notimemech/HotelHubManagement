import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { BookingVersion } from '../../bookings/entities/booking-version.entity';
import { ChecklistLog } from '../../housekeeping/entities/checklist-log.entity';
import { IssueReport } from '../../maintenance/entities/issue-report.entity';
import { MaintenanceProve } from '../../maintenance/entities/maintenance-prove.entity';

@Entity('StaffInfo')
export class StaffInfo {
  @PrimaryGeneratedColumn()
  StaffId: number;

  @Column({ type: 'int', unique: true })
  AccountId: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  CCCD: string;

  @Column({ type: 'nvarchar', length: 100 })
  FullName: string;

  @Column({ type: 'date', nullable: true })
  BirthDate: Date;

  @Column({ type: 'varchar', length: 15, nullable: true })
  Phone: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Address: string;

  @OneToOne(() => Account, (account) => account.staff)
  @JoinColumn({ name: 'AccountId' })
  account: Account;

  @OneToMany(() => BookingVersion, (v) => v.staffInCharge)
  versionsInCharge: BookingVersion[];

  @OneToMany(() => ChecklistLog, (l) => l.staff)
  checklistLogs: ChecklistLog[];

  @OneToMany(() => IssueReport, (i) => i.reporter)
  reportedIssues: IssueReport[];

  @OneToMany(() => MaintenanceProve, (p) => p.maintainer)
  maintenanceProves: MaintenanceProve[];
}
