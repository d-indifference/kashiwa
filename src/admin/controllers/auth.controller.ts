import { Controller, Get } from '@nestjs/common';
import { RenderPug } from '@library/pug';

@Controller('auth')
export class AuthController {
  @Get('sign-up')
  @RenderPug('sign-up')
  public getSignUpForm(): void {}
}
