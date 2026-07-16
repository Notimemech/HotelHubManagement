import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Manager', 'Receptionist', 'Saler', 'Cleaner', 'Maintainer'])
  roleName!: string;
}