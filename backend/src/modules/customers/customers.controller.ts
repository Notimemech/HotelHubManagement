import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles('User', 'Manager', 'Receptionist', 'Saler')
  @Get('profile')
  getProfile(@Request() req) {
    return this.customersService.getProfile(req.user.sub);
  }

  @Roles('User', 'Manager', 'Receptionist', 'Saler')
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.customersService.updateProfile(req.user.sub, dto);
  }
}
