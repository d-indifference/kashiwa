import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { ISession } from '@admin/interfaces';

/**
 * Guard that prevents signed-in users from accessing specific routes (e.g., sign-in page)
 */
@Injectable()
export class SignInGuard implements CanActivate {
  constructor(private readonly userService: UserPersistenceService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const session = req.session as ISession;

    if (session.payload !== undefined) {
      const user = await this.userService.findByIdStrict(session.payload.id);

      if (user) {
        throw new ForbiddenException('You are already registered<br>[<a href="/kashiwa">To management panel</a>]');
      }

      return true;
    }
    return true;
  }
}
