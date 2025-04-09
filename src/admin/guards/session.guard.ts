import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPersistenceService } from '@persistence/services';
import { ISession } from '@admin/interfaces';
import { Response } from 'express';

/**
 * Guard that validates the existence of a user session and checks user roles against required roles
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserPersistenceService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const session = req.session as ISession;

    if (session.payload !== undefined) {
      const user = await this.userService.findByIdStrict(session.payload.id);

      if (user) {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!requiredRoles) {
          return true;
        }

        const userRole = user.role;

        if (!userRole || !requiredRoles.includes(userRole)) {
          throw new ForbiddenException('You don`t have permissions to access this URL');
        } else {
          session.payload.role = userRole;
          return true;
        }
      } else {
        res.status(HttpStatus.FOUND).redirect('/kashiwa/auth/sign-in');
        return false;
      }
    } else {
      res.status(HttpStatus.FOUND).redirect('/kashiwa/auth/sign-in');
      return false;
    }
  }
}
