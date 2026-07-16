import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  serviceName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}