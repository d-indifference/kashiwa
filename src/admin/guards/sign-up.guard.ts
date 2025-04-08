import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { Response } from 'express';

/**
 * Guard that restricts access to the sign-up route based on the existence of users in the system
 */
@Injectable()
export class SignUpGuard implements CanActivate {
  constructor(private readonly userService: UserPersistenceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const res: Response = context.switchToHttp().getResponse();

    const count = await this.userService.countAll();

    if (count === 0) {
      return true;
    }

    res.status(HttpStatus.FOUND).redirect('/kashiwa');

    return false;
  }
}
