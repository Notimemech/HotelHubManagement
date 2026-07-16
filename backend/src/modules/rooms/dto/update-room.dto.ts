import { IsInt, IsOptional, IsString, Matches, IsUUID } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'roomCode must be a string' })
  roomCode?: string;

  @IsOptional()
  @IsString({ message: 'typeId must be a string' })
  @IsUUID()
  typeId?: string;

  @IsOptional()
  @IsInt({ message: 'floor must be an integer' })
  floor?: number;

  @IsOptional()
  @IsString({ message: 'status must be a string' })
  @Matches(/^(Available|Occupied|Maintenance)$/i, {
    message: 'status must be one of: Available, Occupied, Maintenance',
  })
  status?: string;
}
