import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ROLES } from '../../accounts/roles.constants';

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(ROLES as unknown as string[])
  roleName!: string;
}
