import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueReport } from './entities/issue-report.entity';
import { MaintenanceProve } from './entities/maintenance-prove.entity';
import { IssueAssignment } from './entities/issue-assignment.entity';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IssueReport,
      MaintenanceProve,
      IssueAssignment,
    ]),
    StaffModule,
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
