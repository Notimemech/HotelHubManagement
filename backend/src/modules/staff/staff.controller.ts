import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('register')
  register(@Body() dto: RegisterStaffDto) {
    return this.staffService.createStaff(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() req) {
    const profile = await this.staffService.findByAccountId(req.user.sub);
    return { staff: profile };
  }
}
