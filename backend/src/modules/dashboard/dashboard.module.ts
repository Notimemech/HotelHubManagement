import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { BookingDetail } from '../bookings/entities/booking-detail.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomType } from '../rooms/entities/room-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingVersion,
      BookingDetail,
      Payment,
      Room,
      RoomType,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}