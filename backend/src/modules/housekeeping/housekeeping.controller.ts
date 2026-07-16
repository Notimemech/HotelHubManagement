import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LogChecklistDto } from './dto/log-checklist.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.housekeepingService.createTemplate(dto);
  }

  @Get('templates')
  listTemplates() {
    return this.housekeepingService.listTemplates();
  }

  @UseGuards(AuthGuard)
  @Post('logs')
  log(@Request() req, @Body() dto: LogChecklistDto) {
    return this.housekeepingService.logChecklist(req.user.sub, dto);
  }

  @Get('logs/room/:roomId')
  listByRoom(@Param('roomId') roomId: string) {
    return this.housekeepingService.listLogsByRoom(roomId);
  }
}
