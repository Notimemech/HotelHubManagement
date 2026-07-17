import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistLog } from './entities/checklist-log.entity';
import { RoomAssignment } from './entities/room-assignment.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LogChecklistDto } from './dto/log-checklist.dto';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class HousekeepingService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepo: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistLog)
    private readonly logRepo: Repository<ChecklistLog>,
    @InjectRepository(RoomAssignment)
    private readonly assignmentRepo: Repository<RoomAssignment>,
    private readonly staffService: StaffService,
  ) {}

  createTemplate(dto: CreateTemplateDto): Promise<ChecklistTemplate> {
    return this.templateRepo.save(this.templateRepo.create(dto));
  }

  listTemplates(): Promise<ChecklistTemplate[]> {
    return this.templateRepo.find();
  }

  async logChecklist(
    accountId: string,
    dto: LogChecklistDto,
  ): Promise<ChecklistLog> {
    const staff = await this.staffService.findByAccountId(accountId);
    if (!staff) throw new ForbiddenException('Staff profile not found');

    const assigned = await this.assignmentRepo.findOne({
      where: { roomId: dto.roomId, cleanerId: staff.staffId },
    });
    if (!assigned) {
      throw new ForbiddenException(
        'You are not assigned to this room',
      );
    }

    return this.logRepo.save(
      this.logRepo.create({
        roomId: dto.roomId,
        staffId: staff.staffId,
        templateType: dto.templateType,
        evidenceImage: dto.evidenceImage,
        notes: dto.notes,
      }),
    );
  }

  async listMyAssignments(accountId: string): Promise<RoomAssignment[]> {
    const staff = await this.staffService.findByAccountId(accountId);
    if (!staff) throw new ForbiddenException('Staff profile not found');

    return this.assignmentRepo.find({
      where: { cleanerId: staff.staffId },
      relations: { room: true },
    });
  }

  async listLogsByRoom(roomId: string): Promise<ChecklistLog[]> {
    return this.logRepo.find({
      where: { roomId: roomId },
      relations: { staff: true, room: true },
      order: { logTime: 'DESC' },
    });
  }

  async assignRoom(
    managerAccountId: string,
    roomId: string,
    cleanerStaffId: string,
  ): Promise<RoomAssignment> {
    const manager = await this.staffService.findByAccountId(managerAccountId);
    if (!manager) throw new ForbiddenException('Manager profile not found');

    const cleaner = await this.staffService.findOne(cleanerStaffId);
    if (!cleaner) throw new NotFoundException('Cleaner not found');

    const existing = await this.assignmentRepo.findOne({
      where: { roomId, cleanerId: cleanerStaffId },
    });
    if (existing) return existing;

    return this.assignmentRepo.save(
      this.assignmentRepo.create({
        roomId,
        cleanerId: cleanerStaffId,
        assignedBy: manager.staffId,
      }),
    );
  }
}
