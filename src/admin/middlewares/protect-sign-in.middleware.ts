import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LOCALE } from '@locale/locale';
import { ISession } from '@admin/interfaces';

/**
 * Middleware for protection of `/kashiwa/auth/sign-in` URL.
 * If user is logged in, throw a 403
 */
@Injectable()
export class ProtectSignInMiddleware implements NestMiddleware {
  public use(req: Request, _res: Response, next: NextFunction): void {
    const session: ISession = req.session as unknown as ISession;

    if (session.payload) {
      throw new ForbiddenException(LOCALE['ALREADY_SIGNED_IN']);
    } else {
      next();
    }
  }
}
