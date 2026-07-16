import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { ReportIssueDto } from './dto/report-issue.dto';
import { ProveIssueDto } from './dto/prove-issue.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Roles('User', 'Receptionist', 'Cleaner', 'Maintainer', 'Manager')
  @Post('issues')
  report(@Request() req, @Body() dto: ReportIssueDto) {
    return this.maintenanceService.reportIssue(req.user.sub, dto);
  }

  @Roles('Manager', 'Receptionist', 'Maintainer')
  @Get('issues')
  list() {
    return this.maintenanceService.listIssues();
  }

  @Roles('Maintainer', 'Manager')
  @Post('issues/:id/prove')
  prove(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ProveIssueDto,
  ) {
    return this.maintenanceService.proveIssue(req.user.sub, id, dto);
  }

  @Roles('Manager', 'Receptionist', 'Maintainer')
  @Get('issues/:id/proves')
  listProves(@Param('id') id: string) {
    return this.maintenanceService.listProves(id);
  }
}
