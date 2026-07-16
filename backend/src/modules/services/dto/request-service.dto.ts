import { IsInt, IsNotEmpty, IsString, Min, IsUUID } from 'class-validator';

export class RequestServiceDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bookingId!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  serviceId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
