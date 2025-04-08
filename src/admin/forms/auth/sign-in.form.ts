import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Body object for sign in form
 */
export class SignInForm {
  /**
   * Username
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  username: string;

  /**
   * Password
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
