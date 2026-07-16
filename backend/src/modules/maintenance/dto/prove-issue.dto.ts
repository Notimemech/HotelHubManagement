import { IsOptional, IsString } from 'class-validator';

export class ProveIssueDto {
  @IsOptional()
  @IsString()
  FinishImage?: string;

  @IsOptional()
  @IsString()
  FinishVideo?: string;
}
