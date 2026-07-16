import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hotel/info')
  getHotelInfo() {
    return {
      name: 'Hotel Hub',
      address: '123 Main St, City, Country',
      phone: '+1 234 567 8900',
      email: 'contact@hotelhub.com',
      description: 'The best hotel to stay.',
    };
  }
}
