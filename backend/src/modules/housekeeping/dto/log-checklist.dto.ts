import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LogChecklistDto {
  @IsInt()
  RoomID: number;

  @IsString()
  @IsNotEmpty()
  TemplateType: string;

  @IsOptional()
  @IsString()
  EvidenceImage?: string;

  @IsOptional()
  @IsString()
  Notes?: string;
}
