import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  FullName: string;

  @IsEmail()
  Email: string;

  @IsNotEmpty()
  @IsString()
  Phone: string;

  @IsNotEmpty()
  @MinLength(6)
  Password: string;
}
