import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPersistenceService } from '@persistence/services';
import { ISession } from '@admin/interfaces';

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
        this.throwForbiddenWithSignInLink();
        return false;
      }
    } else {
      this.throwForbiddenWithSignInLink();
      return false;
    }
  }

  private throwForbiddenWithSignInLink() {
    throw new ForbiddenException(
      'You need to be authorized to access this page.<br>[<a href="/kashiwa/auth/sign-in">Authorize</a>]'
    );
  }
}
