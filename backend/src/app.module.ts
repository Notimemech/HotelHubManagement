import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ServicesModule } from './services/services.module';

import { Customer } from './customers/entities/customer.entity';
import { RoomType } from './rooms/entities/room-type.entity';
import { Room } from './rooms/entities/room.entity';
import { Booking } from './bookings/entities/booking.entity';
import { BookingDetail } from './bookings/entities/booking-detail.entity';
import { Payment } from './payments/entities/payment.entity';
import { Service } from './services/entities/service.entity';
import { BookingService } from './services/entities/booking-service.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASS || 'YourStrongPassword!',
      database: process.env.DB_NAME || 'HotelHubManagement',
      entities: [
        Customer,
        RoomType,
        Room,
        Booking,
        BookingDetail,
        Payment,
        Service,
        BookingService
      ],
      synchronize: false,
      extra: {
        trustServerCertificate: true,
      }
    }),
    AuthModule,
    CustomersModule,
    RoomsModule,
    BookingsModule,
    PaymentsModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
