import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('availability')
  checkAvailability(
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('guests') guests: string,
  ) {
    return this.roomsService.checkAvailability(
      checkIn,
      checkOut,
      guests ? Number(guests) : undefined,
    );
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager', 'Receptionist')
  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.roomsService.setStatus(id, status);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}