import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * Body object for staff creation form
 */
export class StaffCreateForm {
  /**
   * Username
   */
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  username: string;

  /**
   * Email
   */
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Length(3, 255)
  email: string;

  /**
   * Role
   */
  @IsString()
  @IsNotEmpty()
  @IsIn([UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  role: UserRole;

  /**
   * Non-hashed password
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
