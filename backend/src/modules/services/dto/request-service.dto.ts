import { IsInt, Min } from 'class-validator';

export class RequestServiceDto {
  @IsInt()
  BookingId: number;

  @IsInt()
  ServiceId: number;

  @IsInt()
  @Min(1)
  Quantity: number;
}
