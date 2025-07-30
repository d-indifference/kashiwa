import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { NextFunction, Request, Response } from 'express';
import { LOCALE } from '@locale/locale';

/**
 * Middleware for protection of `/kashiwa/auth/sign-up` URL.
 * If `user` table is not empty, throws 403
 */
@Injectable()
export class ProtectSignUpMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserPersistenceService) {}

  public async use(_req: Request, _res: Response, next: NextFunction): Promise<void> {
    const count = await this.userService.countAll();

    if (count === 0) {
      next();
    } else {
      throw new ForbiddenException(LOCALE['YOU_DONT_NEED_TO_SIGN_UP']);
    }
  }
}
