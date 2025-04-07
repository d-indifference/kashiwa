import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { SignInForm, SignUpForm } from '@admin/forms/auth';
import { Response, Request } from 'express';
import { UserCreateDto } from '@persistence/dto/user';
import { UserRole } from '@prisma/client';
import { ISession } from '@admin/interfaces';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserPersistenceService) {}

  public async signUp(form: SignUpForm, session: ISession, res: Response): Promise<void> {
    const dto = new UserCreateDto(form.username, form.email, form.password, UserRole.ADMINISTRATOR);

    const user = await this.userService.create(dto);

    await this.signIn({ username: user.username, password: form.password }, session, res);
  }

  public async signIn(form: SignInForm, session: ISession, res: Response): Promise<void> {
    const user = await this.userService.signIn(form.username, form.password);

    session.payload = { id: user.id, role: user.role };

    res.redirect('/kashiwa');
  }

  public signOut(req: Request, res: Response): void {
    req.session.destroy(err => {
      if (err) {
        throw new InternalServerErrorException(err);
      }
    });

    res.redirect('/kashiwa/auth/sign-in');
  }
}
