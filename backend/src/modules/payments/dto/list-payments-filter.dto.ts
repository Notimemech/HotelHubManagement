import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class ListPaymentsFilterDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Pending', 'Paid', 'Failed'])
  status?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;
}