import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { BookingService } from './entities/booking-service.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, BookingService, Booking])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
