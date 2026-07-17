import {
  Controller,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSaleBookingDto } from './dto/create-sale-booking.dto';
import { UpdateSaleBookingDto } from './dto/update-sale-booking.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('Saler')
@Controller('sale/bookings')
export class SaleBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  createForSaler(@Request() req, @Body() dto: CreateSaleBookingDto) {
    return this.bookingsService.createForSaler(req.user.sub, dto);
  }

  @Put(':id')
  updateForSaler(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSaleBookingDto,
  ) {
    return this.bookingsService.updateForSaler(req.user.sub, id, dto);
  }

  @Delete(':id')
  softDelete(@Request() req, @Param('id') id: string) {
    return this.bookingsService.softDelete(req.user.sub, id);
  }

  @Patch(':id/cancel')
  cancelForSaler(@Request() req, @Param('id') id: string) {
    return this.bookingsService.cancelForSaler(req.user.sub, id);
  }
}
