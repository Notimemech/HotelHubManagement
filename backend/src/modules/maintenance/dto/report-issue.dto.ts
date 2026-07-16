import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReportIssueDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  issueImage?: string;
}
