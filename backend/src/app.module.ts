import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1403',
      database: 'HotelHubManagement',
      autoLoadEntities:true,
      synchronize: true,
    }),CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
