import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { SignInForm, SignUpForm } from '@admin/forms/auth';
import { Response, Request } from 'express';
import { UserCreateDto } from '@persistence/dto/user';
import { UserRole } from '@prisma/client';
import { ISession } from '@admin/interfaces';
import { LOCALE } from '@locale/locale';

/**
 * Authentication service for admin panel
 */
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserPersistenceService) {}

  /**
   * Check if sign up option is available and returns sign up form or throws 403
   * @param res `Express.js` response
   */
  public async checkSignUpAccessAndResponse(res: Response): Promise<void> {
    const count = await this.userService.countAll();

    if (count === 0) {
      res.render('admin/auth/admin-sign-up');
    } else {
      res.status(HttpStatus.FORBIDDEN).render('error', {
        message: LOCALE['YOU_DONT_NEED_TO_SIGN_UP']
      });
    }
  }

  /**
   * Check if sign in option is available and returns sign up form or throws 403
   * @param res `Express.js` response
   * @param session Session object
   */
  public checkSignInAccessAndResponse(res: Response, session: ISession): void {
    if (!session.payload) {
      res.render('admin/auth/admin-sign-in');
    } else {
      res.status(HttpStatus.FORBIDDEN).render('error', { message: LOCALE['ALREADY_SIGNED_IN'] });
    }
  }

  /**
   * Sign up a new user (administrator). First user on admin panel always should be an administrator
   * @param form Sign up form data
   * @param session Session object
   * @param res Express.js `Response` object
   */
  public async signUp(form: SignUpForm, session: ISession, res: Response): Promise<void> {
    const dto = new UserCreateDto(form.username, form.email, form.password, UserRole.ADMINISTRATOR);

    const user = await this.userService.create(dto);

    await this.signIn({ username: user.username, password: form.password }, session, res);
  }

  /**
   * Sign in a user
   * @param form Sign in form data
   * @param session Session object
   * @param res Express.js `Response` object
   */
  public async signIn(form: SignInForm, session: ISession, res: Response): Promise<void> {
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
    req.session.destroy(err => {
      if (err) {
        throw new InternalServerErrorException(err);
      }
    });

    res.redirect('/kashiwa/auth/sign-in');
  }
}
