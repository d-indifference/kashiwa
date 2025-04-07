import { UserRole } from '@prisma/client';

export interface ISessionPayload {
  id: string;

  role: UserRole;
}
