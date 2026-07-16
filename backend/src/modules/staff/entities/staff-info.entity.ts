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
  @PrimaryGeneratedColumn('uuid', { name: 'StaffId' })
  staffId!: string;

  @Column({ name: 'AccountId', type: 'uniqueidentifier', unique: true })
  accountId!: string;

  @Column({ name: 'CCCD', type: 'varchar', length: 20, unique: true })
  cccd!: string;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName!: string;

  @Column({ name: 'BirthDate', type: 'date', nullable: true })
  birthDate!: Date;

  @Column({ name: 'Phone', type: 'varchar', length: 15, nullable: true })
  phone!: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 255, nullable: true })
  address!: string;

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
