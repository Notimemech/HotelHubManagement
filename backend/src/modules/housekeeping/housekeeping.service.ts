import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistLog } from './entities/checklist-log.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LogChecklistDto } from './dto/log-checklist.dto';

@Injectable()
export class HousekeepingService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepo: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistLog)
    private readonly logRepo: Repository<ChecklistLog>,
  ) {}

  createTemplate(dto: CreateTemplateDto): Promise<ChecklistTemplate> {
    return this.templateRepo.save(this.templateRepo.create(dto));
  }

  listTemplates(): Promise<ChecklistTemplate[]> {
    return this.templateRepo.find();
  }

  logChecklist(staffId: number, dto: LogChecklistDto): Promise<ChecklistLog> {
    return this.logRepo.save(this.logRepo.create({ ...dto, StaffId: staffId }));
  }

  listLogsByRoom(roomId: number): Promise<ChecklistLog[]> {
    return this.logRepo.find({
      where: { RoomID: roomId },
      relations: { staff: true, room: true },
      order: { LogTime: 'DESC' },
    });
  }
}
