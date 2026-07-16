import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsFilterDto } from './dto/list-payments-filter.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('User')
  @Post()
  create(@Request() req, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.sub, dto);
  }

  @Roles('User')
  @Get('history')
  getHistory(@Request() req) {
    return this.paymentsService.getHistory(req.user.sub);
  }

  /* ============================================================
   * Manager / Receptionist scoped
   * ============================================================ */

  @Get('admin')
  @Roles('Manager', 'Receptionist', 'Saler')
  findAllAdmin(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    filter: ListPaymentsFilterDto,
  ) {
    return this.paymentsService.findAllAdmin(filter);
  }

  @Get('admin/:bookingId')
  @Roles('Manager', 'Receptionist', 'Saler')
  findByBookingId(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBookingId(bookingId);
  }

  @Get('admin/booking/:bookingId/summary')
  @Roles('Manager', 'Receptionist', 'Saler')
  getBookingSummary(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getBookingSummary(bookingId);
  }
}
