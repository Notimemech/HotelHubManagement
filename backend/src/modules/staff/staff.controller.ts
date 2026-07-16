import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /** Manager creates a staff account */
  @UseGuards(RolesGuard)
  @Roles('Manager')
  @Post('register')
  register(@Body() dto: RegisterStaffDto) {
    return this.staffService.createStaff(dto);
  }

  /** Manager: list all staff */
  @UseGuards(RolesGuard)
  @Roles('Manager')
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  /** Staff: get own profile — must be before :id to avoid capture */
  @Get('me')
  async me(@Request() req) {
    const profile = await this.staffService.findByAccountId(req.user.sub);
    return { staff: profile };
  }

  /** Manager: get one staff by staffId */
  @UseGuards(RolesGuard)
  @Roles('Manager')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  /** Manager: update staff profile/isActive */
  @UseGuards(RolesGuard)
  @Roles('Manager')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, dto);
  }

  /** Manager: change staff role */
  @UseGuards(RolesGuard)
  @Roles('Manager')
  @Patch(':id/role')
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.staffService.changeRole(id, dto.roleName);
  }
}