import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  Username: string;

  @IsNotEmpty()
  @IsString()
  FullName: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsNotEmpty()
  @MinLength(6)
  Password: string;
}
