import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(AuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.customersService.getProfile(req.user.sub);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.customersService.updateProfile(req.user.sub, dto);
  }
}
