import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';

/**
 * Guard that restricts access to the sign-up route based on the existence of users in the system
 */
@Injectable()
export class SignUpGuard implements CanActivate {
  constructor(private readonly userService: UserPersistenceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const count = await this.userService.countAll();

    return count === 0;
  }
}
