import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRoomTypeDto {
  @IsOptional()
  @IsString()
  typeName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsString()
  description?: string;
}