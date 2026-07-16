import { IsInt, IsOptional, IsString } from 'class-validator';

export class ReportIssueDto {
  @IsInt()
  RoomID: number;

  @IsString()
  Description: string;

  @IsOptional()
  @IsString()
  IssueImage?: string;
}
