import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'RoomCode is required' })
  @IsString({ message: 'RoomCode must be a string' })
  RoomCode: string;

  @IsNotEmpty({ message: 'TypeID is required' })
  @IsInt({ message: 'TypeID must be an integer' })
  TypeID: number;

  @IsOptional()
  @IsInt({ message: 'Floor must be an integer' })
  Floor?: number;

  @IsNotEmpty({ message: 'Status is required' })
  @IsString({ message: 'Status must be a string' })
  @Matches(/^(Available|Occupied|Maintenance)$/i, {
    message: 'Status must be one of: Available, Occupied, Maintenance',
  })
  Status: string;
}
