import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'RoomCode must be a string' })
  RoomCode?: string;

  @IsOptional()
  @IsInt({ message: 'TypeID must be an integer' })
  TypeID?: number;

  @IsOptional()
  @IsInt({ message: 'Floor must be an integer' })
  Floor?: number;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @Matches(/^(Available|Occupied|Maintenance)$/i, {
    message: 'Status must be one of: Available, Occupied, Maintenance',
  })
  Status?: string;
}
