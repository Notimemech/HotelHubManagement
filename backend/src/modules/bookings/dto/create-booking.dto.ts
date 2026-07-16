import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsInt()
  adults!: number;

  @IsInt()
  children!: number;

  @IsArray()
  @IsUUID(4, { each: true })
  roomIds!: string[];

  @IsOptional()
  @IsString()
  specialRequest?: string;
}
