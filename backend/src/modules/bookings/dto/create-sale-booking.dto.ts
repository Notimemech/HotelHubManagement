import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSaleBookingDto {
  @IsString()
  @MaxLength(100)
  customerFullName!: string;

  @IsString()
  @Matches(/^[0-9+\-\s]{8,20}$/, {
    message: 'customerPhone must match /^[0-9+\\-\\s]{8,20}$/',
  })
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerCccd?: string;

  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsInt()
  @Min(1)
  adults!: number;

  @IsInt()
  @Min(0)
  children!: number;

  @IsArray()
  @IsUUID(4, { each: true })
  roomIds!: string[];

  @IsOptional()
  @IsString()
  specialRequest?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13_500_000)
  evidenceImage?: string;
}
