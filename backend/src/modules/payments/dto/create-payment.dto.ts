import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bookingId!: string;

  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsEnum(['Cash', 'Visa', 'Momo', 'VNPay'])
  method!: string;
}
