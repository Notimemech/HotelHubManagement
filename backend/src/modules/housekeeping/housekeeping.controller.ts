import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { LogChecklistDto } from './dto/log-checklist.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
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

  @Roles('Cleaner', 'Manager')
  @Get('templates')
  listTemplates() {
    return this.housekeepingService.listTemplates();
  }

  @Roles('Cleaner', 'Manager')
  @Post('logs')
  log(@Request() req, @Body() dto: LogChecklistDto) {
    return this.housekeepingService.logChecklist(req.user.sub, dto);
  }

  @Roles('Cleaner')
  @Patch('rooms/:roomId/complete')
  complete(
    @Request() req: { user: { sub: string } },
    @Param('roomId', new ParseUUIDPipe()) roomId: string,
  ) {
    return this.housekeepingService.completeCleaning(req.user.sub, roomId);
  }

  @Roles('Cleaner', 'Manager')
  @Get('my-assignments')
  myAssignments(@Request() req) {
    return this.housekeepingService.listMyAssignments(req.user.sub);
  }

  @Roles('Manager', 'Receptionist')
  @Get('logs/room/:roomId')
  listByRoom(@Param('roomId') roomId: string) {
    return this.housekeepingService.listLogsByRoom(roomId);
  }

  @Roles('Manager')
  @Post('assignments')
  assign(@Request() req, @Body() dto: AssignRoomDto) {
    return this.housekeepingService.assignRoom(
      req.user.sub,
      dto.roomId,
      dto.cleanerStaffId,
    );
  }
}
