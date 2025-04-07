import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpForm {
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
