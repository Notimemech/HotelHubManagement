import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  Username: string;

  @IsNotEmpty()
  @IsString()
  Password: string;
}
