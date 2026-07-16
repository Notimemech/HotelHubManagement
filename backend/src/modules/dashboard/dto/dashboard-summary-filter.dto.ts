import { IsDateString, IsOptional } from 'class-validator';

export class DashboardSummaryFilterDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
