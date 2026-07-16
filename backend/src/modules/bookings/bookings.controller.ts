import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateWalkInBookingDto } from './dto/create-walk-in-booking.dto';
import { ListBookingsFilterDto } from './dto/list-bookings-filter.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles('User')
  @Post()
  create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  /**
   * Receptionist-only endpoint: create Booking on behalf guest who
   * has no online account (walk-in). Auto-creates stub Customer if needed.
   */
  @Post('walk-in')
  @Roles('Receptionist', 'Manager', 'Saler')
  createWalkIn(@Request() req, @Body() dto: CreateWalkInBookingDto) {
    return this.bookingsService.createWalkIn(req.user.sub, dto);
  }

  /* ============================================================
   * Staff Admin Scoped Routes (Declared BEFORE :id parameter)
   * ============================================================ */

  @Get('admin')
  @Roles('Manager', 'Receptionist', 'Saler')
  findAllForStaff(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    filter: ListBookingsFilterDto,
  ) {
    return this.bookingsService.findAllForStaff(filter);
  }

  @Get('admin/:id')
  @Roles('Manager', 'Receptionist', 'Saler')
  findOneForStaff(@Param('id') id: string) {
    return this.bookingsService.findOneForStaff(id);
  }

  @Get('admin/:id/versions')
  @Roles('Manager', 'Receptionist', 'Saler')
  listVersionsForStaff(@Param('id') id: string) {
    return this.bookingsService.listVersionsForStaff(id);
  }

  @Post('admin/:id/checkout')
  @Roles('Manager', 'Receptionist', 'Saler')
  checkout(@Param('id') id: string) {
    return this.bookingsService.checkout(id);
  }

  /* ============================================================
   * Customer Scoped Routes
   * ============================================================ */

  @Roles('User')
  @Get()
  findAll(@Request() req) {
    return this.bookingsService.findAll(req.user.sub);
  }

  @Roles('User')
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookingsService.findOne(req.user.sub, id);
  }

  @Roles('User')
  @Get(':id/versions')
  listVersions(@Request() req, @Param('id') id: string) {
    return this.bookingsService.listVersions(req.user.sub, id);
  }

  @Roles('User')
  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.update(req.user.sub, id, dto);
  }

  @Roles('User')
  @Post(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.bookingsService.cancel(req.user.sub, id);
  }
}
