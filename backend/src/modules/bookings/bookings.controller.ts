import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateWalkInBookingDto } from './dto/create-walk-in-booking.dto';

@UseGuards(AuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  /**
   * Receptionist-only endpoint: create a Booking on behalf of a guest who
   * has no online account (walk-in). Auto-creates a stub Customer if needed.
   */
  @Post('walk-in')
  @UseGuards(RolesGuard)
  @Roles('Receptionist')
  createWalkIn(@Request() req, @Body() dto: CreateWalkInBookingDto) {
    return this.bookingsService.createWalkIn(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.bookingsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookingsService.findOne(req.user.sub, id);
  }

  @Get(':id/versions')
  listVersions(@Request() req, @Param('id') id: string) {
    return this.bookingsService.listVersions(req.user.sub, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.bookingsService.update(req.user.sub, id, updateData);
  }

  @Post(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.bookingsService.cancel(req.user.sub, id);
  }
}
