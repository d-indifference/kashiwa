import { Body, Controller, Get, Post, Render, Req, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { LOCALE } from '@locale/locale';
import { FormDataRequest } from 'nestjs-form-data';
import { ISession } from '@admin/interfaces';
import { Request, Response } from 'express';
import { AuthService } from '@admin/services';
import { RenderableFormPage, FormPage } from '@admin/lib';
import { AuthSignUpForm, AuthSignInForm } from '@admin/forms';
import { SessionGuard } from '@admin/guards';
import { SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

@Controller('kashiwa/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Get('sign-up')
  @Render('admin/auth_form_page')
  public getSignUpForm(): RenderableFormPage {
    this.logger.debug('URL called: GET /kashiwa/auth/sign-up');

    return FormPage.toTemplateContent(new AuthSignUpForm(), {
      pageTitle: this.siteContext.getGlobalSettings().siteName,
      pageSubtitle: LOCALE.SIGN_UP as string,
      goBack: '/front'
    });
  }

  @Get('sign-in')
  @Render('admin/auth_form_page')
  public getSignInForm(): RenderableFormPage {
    this.logger.debug('URL called: GET /kashiwa/auth/sign-in');

    return FormPage.toTemplateContent(new AuthSignInForm('', ''), {
      pageTitle: this.siteContext.getGlobalSettings().siteName,
      pageSubtitle: LOCALE.SIGN_IN as string,
      goBack: '/front'
    });
  }

  @Post('sign-up')
  @FormDataRequest()
  public async signUp(
    @Body(new ValidationPipe({ transform: true })) form: AuthSignUpForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ session, form }, 'URL called: POST /kashiwa/auth/sign-up');

    await this.authService.signUp(form, session, res);
  }

  @Post('sign-in')
  @FormDataRequest()
  public async signIn(
    @Body(new ValidationPipe({ transform: true })) form: AuthSignInForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ session, form }, 'URL called: POST /kashiwa/auth/sign-in');

    await this.authService.signIn(form, session, res);
  }

  @Post('sign-out')
  @UseGuards(SessionGuard)
  public signOut(@Req() req: Request, @Res() res: Response): void {
    this.logger.debug('URL called: POST /kashiwa/auth/sign-out');

    this.authService.signOut(req, res);
  }
}
