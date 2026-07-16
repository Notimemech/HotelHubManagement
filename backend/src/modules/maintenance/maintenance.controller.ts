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

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @UseGuards(AuthGuard)
  @Post('issues')
  report(@Request() req, @Body() dto: ReportIssueDto) {
    return this.maintenanceService.reportIssue(req.user.sub, dto);
  }

  @Get('issues')
  list() {
    return this.maintenanceService.listIssues();
  }

  @UseGuards(AuthGuard)
  @Post('issues/:id/prove')
  prove(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ProveIssueDto,
  ) {
    return this.maintenanceService.proveIssue(req.user.sub, id, dto);
  }

  @Get('issues/:id/proves')
  listProves(@Param('id') id: string) {
    return this.maintenanceService.listProves(id);
  }
}
