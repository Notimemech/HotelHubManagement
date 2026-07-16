import { IsOptional, IsString } from 'class-validator';

export class ProveIssueDto {
  @IsOptional()
  @IsString()
  finishImage?: string;

  @IsOptional()
  @IsString()
  finishVideo?: string;
}
