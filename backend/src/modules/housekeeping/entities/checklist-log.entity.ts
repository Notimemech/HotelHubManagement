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
  @PrimaryGeneratedColumn()
  LogId: number;

  @Column({ type: 'int' })
  RoomID: number;

  @Column({ type: 'int' })
  StaffId: number;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  TemplateType: string;

  @CreateDateColumn({ type: 'datetime' })
  LogTime: Date;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  EvidenceImage: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  Notes: string;

  @ManyToOne(() => Room, (room) => room.checklistLogs)
  @JoinColumn({ name: 'RoomID' })
  room: Room;

  @ManyToOne(() => StaffInfo, (staff) => staff.checklistLogs)
  @JoinColumn({ name: 'StaffId' })
  staff: StaffInfo;

  @ManyToOne(() => ChecklistTemplate, (tpl) => tpl.logs)
  @JoinColumn({ name: 'TemplateType', referencedColumnName: 'TemplateType' })
  template: ChecklistTemplate;
}
