import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LogChecklistDto } from './dto/log-checklist.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Roles('Manager')
  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.housekeepingService.createTemplate(dto);
  }

  @Roles('Manager')
  @Get('templates')
  listTemplates() {
    return this.housekeepingService.listTemplates();
  }

  @Roles('Cleaner', 'Manager')
  @Post('logs')
  log(@Request() req, @Body() dto: LogChecklistDto) {
    return this.housekeepingService.logChecklist(req.user.sub, dto);
  }

  @Roles('Manager', 'Receptionist')
  @Get('logs/room/:roomId')
  listByRoom(@Param('roomId') roomId: string) {
    return this.housekeepingService.listLogsByRoom(roomId);
  }
}
