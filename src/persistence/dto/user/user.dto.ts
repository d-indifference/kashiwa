import { UserRole } from '@prisma/client';

/**
 * DTO with information about user
 */
export class UserDto {
  /**
   * ID
   */
  id: string;

  /**
   * Username
   */
  username: string;

  /**
   * Email
   */
  email: string;

  /**
   * Role on site
   */
  role: UserRole;

  /**
   * @param id ID
   * @param username Username
   * @param email Email
   * @param role Role on site
   */
  constructor(id: string, username: string, email: string, role: UserRole) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }
}
