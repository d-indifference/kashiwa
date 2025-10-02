import { UserPersistenceService } from '@persistence/services';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserCreateDto } from '@persistence/dto/user';
import { Response, Request } from 'express';
import { UserRole } from '@prisma/client';
import { AuthSignInForm, AuthSignUpForm } from '@admin/forms';
import { ISession } from '@admin/interfaces';
import { PinoLogger } from 'nestjs-pino';

/**
 * Authentication service for admin panel
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Sign up a new user (administrator). First user on admin panel always should be an administrator
   * @param form Sign up form data
   * @param session Session object
   * @param res Express.js `Response` object
   */
  public async signUp(form: AuthSignUpForm, session: ISession, res: Response): Promise<void> {
    this.logger.info({ form, session }, 'signUp');

    const dto = new UserCreateDto(form.username, form.email, form.password, UserRole.ADMINISTRATOR);

    const user = await this.userService.create(dto);

    const signInForm = new AuthSignInForm(user.username, form.password);

    await this.signIn(signInForm, session, res);
  }

  /**
   * Sign in a user
   * @param form Sign in form data
   * @param session Session object
   * @param res Express.js `Response` object
   */
  public async signIn(form: AuthSignInForm, session: ISession, res: Response): Promise<void> {
    this.logger.info({ form, session }, 'signIn');

    const user = await this.userService.signIn(form.username, form.password);

    session.payload = { id: user.id, role: user.role };

    res.redirect('/kashiwa');
  }

  /**
   * Sign out for a user
   * @param req Express.js `Request` object
   * @param res Express.js `Response` object
   */
  public signOut(req: Request, res: Response): void {
    this.logger.info('signOut');

    req.session.destroy(err => {
      if (err) {
        throw new InternalServerErrorException(err);
      }
    });

    res.redirect('/kashiwa/auth/sign-in');
  }
}
