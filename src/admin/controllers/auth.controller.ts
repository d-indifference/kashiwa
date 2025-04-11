import { Body, Controller, Get, Post, Render, Req, Res, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { SignInForm, SignUpForm } from '@admin/forms/auth';
import { ISession } from '@admin/interfaces';
import { Response, Request } from 'express';
import { SessionGuard, SignInGuard, SignUpGuard } from '@admin/guards';
import { AuthService } from '@admin/services';

@Controller('kashiwa/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sign-up')
  public async getSignUpForm(@Res() res: Response): Promise<void> {
    await this.authService.checkSignUpAccessAndResponse(res);
  }

  @Get('sign-in')
  @UseGuards(SignInGuard)
  @Render('admin-sign-in')
  public getSignInForm(): void {}

  @Post('sign-up')
  @FormDataRequest()
  @UseGuards(SignUpGuard)
  public async signUp(
    @Body(new ValidationPipe({ transform: true })) form: SignUpForm,
    @Session() session: ISession,
    @Res() res: Response
  ): Promise<void> {
    await this.authService.signUp(form, session, res);
  }

  @Post('sign-in')
  @UseGuards(SignInGuard)
  @FormDataRequest()
  public async signIn(
    @Body(new ValidationPipe({ transform: true })) form: SignInForm,
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
