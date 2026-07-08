import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  FullName?: string;

  @IsOptional()
  @IsString()
  Avatar?: string;
}
