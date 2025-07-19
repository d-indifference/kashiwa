import { Body, Controller, Get, Post, Render, Req, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { LOCALE } from '@locale/locale';
import { FormDataRequest } from 'nestjs-form-data';
import { ISession } from '@admin/interfaces';
import { Request, Response } from 'express';
import { AuthService } from '@admin/services';
import { RenderableFormPage, FormPage } from '@admin/lib';
import { AuthSignUpForm, AuthSignInForm } from '@admin/forms';
import { SessionGuard } from '@admin/guards';

@Controller('kashiwa/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sign-up')
  @Render('admin/auth_form_page')
  public getSignUpForm(): RenderableFormPage {
    return FormPage.toTemplateContent(new AuthSignUpForm(), {
      pageTitle: global.GLOBAL_SETTINGS.siteName,
      pageSubtitle: LOCALE.SIGN_UP as string,
      goBack: '/front'
    });
  }

  @Get('sign-in')
  @Render('admin/auth_form_page')
  public getSignInForm(): RenderableFormPage {
    return FormPage.toTemplateContent(new AuthSignInForm('', ''), {
      pageTitle: global.GLOBAL_SETTINGS.siteName,
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
    await this.authService.signUp(form, session, res);
  }

  @Post('sign-in')
  @FormDataRequest()
  public async signIn(
    @Body(new ValidationPipe({ transform: true })) form: AuthSignInForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    await this.authService.signIn(form, session, res);
  }

  @Post('sign-out')
  @UseGuards(SessionGuard)
  public signOut(@Req() req: Request, @Res() res: Response): void {
    this.authService.signOut(req, res);
  }
}
