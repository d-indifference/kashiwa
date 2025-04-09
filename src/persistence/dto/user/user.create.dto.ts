import { UserRole } from '@prisma/client';

/**
 * DTO with information about new user creation
 */
export class UserCreateDto {
  /**
   * Username
   */
  username: string;

  /**
   * Email
   */
  email: string;

  /**
   * Non-hashed password
   */
  password: string;

  /**
   * Role on site
   */
  role: UserRole;

  /**
   * @param username Username
   * @param email Email
   * @param password Non-hashed password
   * @param role Role on site
   */
  constructor(username: string, email: string, password: string, role: UserRole) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  /**
   * Stringify object
   */
  public toString(): string {
    return `UserCreateDto { username: "${this.username}", email: "${this.email}", password: "***", role: "${this.role}" }`;
  }
}
