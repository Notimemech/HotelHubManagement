import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestServiceDto } from './dto/request-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('User', 'Manager', 'Receptionist')
  @Post('request')
  requestService(@Request() req, @Body() dto: RequestServiceDto) {
    return this.servicesService.requestService(req.user.sub, dto);
  }
}