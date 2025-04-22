import { UserDto } from '@persistence/dto/user';

/**
 * DTO with information of the ban
 */
export class BanDto {
  /**
   * ID
   */
  id: string;

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * Banned IP
   */
  ip: string;

  /**
   * Ban duration
   */
  till: Date;

  /**
   * Ban reason
   */
  reason: string;

  /**
   * User who creates the ban
   */
  user?: UserDto | null;

  constructor(id: string, createdAt: Date, ip: string, till: Date, reason: string, user: UserDto | null) {
    this.id = id;
    this.createdAt = createdAt;
    this.ip = ip;
    this.till = till;
    this.reason = reason;
    this.user = user;
  }
}
