import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  TemplateType: string;

  @IsString()
  @IsNotEmpty()
  ItemName: string;

  @IsOptional()
  @IsString()
  Description?: string;
}
