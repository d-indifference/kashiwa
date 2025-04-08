import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';

/**
 * Body object for staff updating form
 */
export class StaffUpdateForm {
  /**
   * Update candidate object ID (strictly required)
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  /**
   * Username
   */
  @IsOptional()
  @IsString()
  @Length(3, 255)
  @Transform(emptyFormText)
  username?: string;

  /**
   * Email
   */
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(3, 255)
  @Transform(emptyFormText)
  email?: string;

  /**
   * Role
   */
  @IsOptional()
  @IsString()
  @IsIn([UserRole.ADMINISTRATOR, UserRole.MODERATOR])
  role?: UserRole;

  /**
   * Non-hashed password
   */
  @IsOptional()
  @IsString()
  @Transform(emptyFormText)
  password?: string;
}
