import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  OldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  NewPassword: string;
}
