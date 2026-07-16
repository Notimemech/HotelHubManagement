import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  CheckIn: string;

  @IsDateString()
  CheckOut: string;

  @IsInt()
  Adults: number;

  @IsInt()
  Children: number;

  @IsArray()
  RoomIds: number[];

  @IsOptional()
  @IsString()
  SpecialRequest?: string;
}
