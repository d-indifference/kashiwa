import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { Response } from 'express';
import { ISession } from '@admin/interfaces';

@Injectable()
export class SignInGuard implements CanActivate {
  constructor(private readonly userService: UserPersistenceService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const session = req.session as ISession;

    if (session.payload !== undefined) {
      const user = await this.userService.findByIdStrict(session.payload.id);

      if (user) {
        res.status(HttpStatus.FOUND).redirect('/kashiwa');
        return false;
      }
      return true;
    }
    return true;
  }
}
