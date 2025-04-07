import { UserRole } from '@prisma/client';

export class UserCreateDto {
  username: string;

  email: string;

  password: string;

  role: UserRole;

  constructor(username: string, email: string, password: string, role: UserRole) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  public toString(): string {
    return `UserCreateDto { username: "${this.username}", email: "${this.email}", password: "***", role: "${this.role}" }`;
  }
}
