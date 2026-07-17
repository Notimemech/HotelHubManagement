import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignRoomDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cleanerStaffId!: string;
}
