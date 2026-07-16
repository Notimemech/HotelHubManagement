import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomTypesController } from './room-types.controller';
import { RoomsService } from './rooms.service';
import { RoomTypesService } from './room-types.service';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';
import { BookingDetail } from '../bookings/entities/booking-detail.entity';
import { BookingVersion } from '../bookings/entities/booking-version.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      RoomType,
      BookingDetail,
      BookingVersion,
      Booking,
    ]),
  ],
  controllers: [RoomsController, RoomTypesController],
  providers: [RoomsService, RoomTypesService],
  exports: [RoomsService, RoomTypesService],
})
export class RoomsModule {}