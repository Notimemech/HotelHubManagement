import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChecklistLog } from './checklist-log.entity';

@Entity('ChecklistTemplates')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid', { name: 'TemplateId' })
  templateId!: string;

  @Column({
    name: 'TemplateType',
    type: 'nvarchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  templateType!: string;

  @Column({ name: 'ItemName', type: 'nvarchar', length: 255 })
  itemName!: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  description!: string;

  @OneToMany(() => ChecklistLog, (log) => log.template)
  logs: ChecklistLog[];
}
