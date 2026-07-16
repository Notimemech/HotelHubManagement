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
  Username: string;

  @IsString()
  @MinLength(6)
  Password: string;

  @IsString()
  @IsNotEmpty()
  FullName: string;

  @IsString()
  @IsNotEmpty()
  CCCD: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @IsString()
  Address?: string;

  @IsOptional()
  @IsDateString()
  BirthDate?: string;

  @IsString()
  @IsNotEmpty()
  Role: string;
}
