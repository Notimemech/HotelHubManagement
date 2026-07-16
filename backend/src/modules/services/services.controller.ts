import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../auth/auth.guard';
import { RequestServiceDto } from './dto/request-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post('request')
  requestService(@Request() req, @Body() dto: RequestServiceDto) {
    return this.servicesService.requestService(req.user.sub, dto);
  }
}
