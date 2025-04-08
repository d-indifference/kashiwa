import { UserRole } from '@prisma/client';

/**
 * DTO with information about new user updating
 */
export class UserUpdateDto {
  /**
   * ID (strictly required)
   */
  id: string;

  /**
   * Username
   */
  username?: string;

  /**
   * Email
   */
  email?: string;

  /**
   * Non-hashed password
   */
  password?: string;

  /**
   * Role on site
   */
  role?: UserRole;

  /**
   * @param id ID (strictly required)
   * @param username Username
   * @param email Email
   * @param password Non-hashed password
   * @param role Role on site
   */
  constructor(id: string, username?: string, email?: string, password?: string, role?: UserRole) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  /**
   * Stringify object
   */
  public toString(): string {
    return `UserUpdateDto { id: "${this.id}" username: "${this.username}", email: "${this.email}", password: "***", role: "${this.role}" }`;
  }
}
