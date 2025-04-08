import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Body object for sign up form
 */
export class SignUpForm {
  /**
   * Username
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  username: string;

  /**
   * Email
   */
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(3, 256)
  email: string;

  /**
   * Password
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
