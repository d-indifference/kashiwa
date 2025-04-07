import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInForm {
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
