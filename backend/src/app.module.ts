import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './modules/customer/customer.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [DatabaseModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
