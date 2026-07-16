import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  BookingId: number;

  @IsNumber()
  Amount: number;

  @IsNotEmpty()
  @IsEnum(['Cash', 'Visa', 'Momo', 'VNPay'])
  Method: string;
}
