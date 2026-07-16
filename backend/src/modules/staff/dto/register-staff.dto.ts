import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';

export class RegisterStaffDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  cccd!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}
