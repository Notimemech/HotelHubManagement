import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export class CreateWalkInBookingDto extends CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerFullName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerCccd?: string;
}
