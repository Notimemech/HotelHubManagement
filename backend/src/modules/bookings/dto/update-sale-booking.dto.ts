import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSaleBookingDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  adults?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  roomIds?: string[];

  @IsOptional()
  @IsString()
  specialRequest?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(13_500_000)
  requestEvidenceImage!: string;

  @IsOptional()
  @IsString()
  changeReason?: string;
}
