import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistLog } from './entities/checklist-log.entity';
import { HousekeepingService } from './housekeeping.service';
import { HousekeepingController } from './housekeeping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChecklistTemplate, ChecklistLog])],
  controllers: [HousekeepingController],
  providers: [HousekeepingService],
  exports: [HousekeepingService],
})
export class HousekeepingModule {}
