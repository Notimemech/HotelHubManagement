import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistLog } from './entities/checklist-log.entity';
import { RoomAssignment } from './entities/room-assignment.entity';
import { HousekeepingService } from './housekeeping.service';
import { HousekeepingController } from './housekeeping.controller';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChecklistTemplate, ChecklistLog, RoomAssignment]),
    StaffModule,
  ],
  controllers: [HousekeepingController],
  providers: [HousekeepingService],
  exports: [HousekeepingService],
})
export class HousekeepingModule {}
