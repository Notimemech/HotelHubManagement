import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  Username: string; // can be email or phone

  @IsNotEmpty()
  @IsString()
  Password: string;
}
