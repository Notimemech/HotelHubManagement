import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  last_name: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  gender?: string;

  @IsDateString()
  date_of_birth: Date;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phone_number: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  nationality?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  identity_number: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  customer_type?: string;
}