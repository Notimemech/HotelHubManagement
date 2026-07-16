import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class ListBookingsFilterDto {
  @IsOptional()
  @IsString()
  @IsIn(['Pending', 'Confirmed', 'Completed', 'Cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}