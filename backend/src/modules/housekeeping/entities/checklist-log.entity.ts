import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { StaffInfo } from '../../staff/entities/staff-info.entity';
import { ChecklistTemplate } from './checklist-template.entity';

@Entity('ChecklistLogs')
export class ChecklistLog {
  @PrimaryGeneratedColumn('uuid')
  logId!: string;

  @Column({ name: 'RoomID', type: 'uniqueidentifier' })
  roomId!: string;

  @Column({ name: 'StaffId', type: 'uniqueidentifier' })
  staffId!: string;

  @Column({ name: 'TemplateType', type: 'nvarchar', length: 50, nullable: true })
  templateType!: string;

  @CreateDateColumn({ name: 'LogTime', type: 'datetime' })
  logTime!: Date;

  @Column({ name: 'EvidenceImage', type: 'nvarchar', length: 'MAX', nullable: true })
  evidenceImage!: string;

  @Column({ name: 'Notes', type: 'nvarchar', length: 'MAX', nullable: true })
  notes!: string;

  @ManyToOne(() => Room, (room) => room.checklistLogs)
  @JoinColumn({ name: 'RoomID' })
  room?: Room;

  @ManyToOne(() => StaffInfo, (staff) => staff.checklistLogs)
  @JoinColumn({ name: 'StaffId' })
  staff?: StaffInfo;

  @ManyToOne(() => ChecklistTemplate, (tpl) => tpl.logs)
  @JoinColumn({ name: 'TemplateType', referencedColumnName: 'templateType' })
  template?: ChecklistTemplate;
}
