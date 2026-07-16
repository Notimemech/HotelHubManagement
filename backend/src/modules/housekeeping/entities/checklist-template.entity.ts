import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChecklistLog } from './checklist-log.entity';

@Entity('ChecklistTemplates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn()
  TemplateId: number;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  TemplateType: string;

  @Column({ type: 'nvarchar', length: 255 })
  ItemName: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  Description: string;

  @OneToMany(() => ChecklistLog, (log) => log.template)
  logs: ChecklistLog[];
}
