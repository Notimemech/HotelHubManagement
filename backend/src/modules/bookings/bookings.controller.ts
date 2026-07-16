import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@UseGuards(AuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.bookingsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(req.user.sub, id);
  }

  @Get(':id/versions')
  listVersions(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.listVersions(req.user.sub, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
  ) {
    return this.bookingsService.update(req.user.sub, id, updateData);
  }

  @Post(':id/cancel')
  cancel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(req.user.sub, id);
  }
}
