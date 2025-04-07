import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('sign-up')
  public getSignUpForm(): void {}
}
