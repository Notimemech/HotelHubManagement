import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty({ message: 'roomCode is required' })
  @IsString({ message: 'roomCode must be a string' })
  roomCode!: string;

  @IsNotEmpty({ message: 'typeId is required' })
  @IsString({ message: 'typeId must be a string' })
  @IsUUID()
  typeId!: string;

  @IsOptional()
  @IsInt({ message: 'floor must be an integer' })
  floor?: number;

  @IsNotEmpty({ message: 'status is required' })
  @IsString({ message: 'status must be a string' })
  @Matches(/^(Available|Occupied|Maintenance)$/i, {
    message: 'status must be one of: Available, Occupied, Maintenance',
  })
  status!: string;
}
