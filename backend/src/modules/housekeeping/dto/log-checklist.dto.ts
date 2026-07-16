import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class LogChecklistDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  templateType!: string;

  @IsOptional()
  @IsString()
  evidenceImage?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
