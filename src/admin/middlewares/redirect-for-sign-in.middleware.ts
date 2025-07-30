import { ISession } from '@admin/interfaces';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware for admin panel routes.
 * If user is not logged in, redirects to sign in page
 */
@Injectable()
export class RedirectForSignInMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction): void {
    const isAdminPanelProtectedRoute = /^\/kashiwa(?!\/(?:auth|post|delete))(\/.*)?$/.test(req.path);
    const session: ISession = req.session as unknown as ISession;
    const isAuthenticated = session.payload;

    if (isAdminPanelProtectedRoute && !isAuthenticated) {
      return res.redirect('/kashiwa/auth/sign-in');
    }

    next();
  }
}
