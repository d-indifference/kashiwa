import { UserRole } from '@prisma/client';

export class UserDto {
  id: string;

  username: string;

  email: string;

  role: UserRole;

  constructor(id: string, username: string, email: string, role: UserRole) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }
}
