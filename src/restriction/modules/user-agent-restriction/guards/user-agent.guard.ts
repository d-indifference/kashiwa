import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ForbiddenUserAgentsProvider } from '@restriction/modules/user-agent-restriction/providers';
import { Request } from 'express';
import { LOCALE } from '@locale/locale';

@Injectable()
export class UserAgentGuard implements CanActivate {
  constructor(private readonly forbiddenUserAgentsProvider: ForbiddenUserAgentsProvider) {}

  public canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const allowedUserAgent = this.forbiddenUserAgentsProvider.checkUserAgent(
      request,
      Boolean(request.session['payload'])
    );

    if (!allowedUserAgent) {
      throw new ForbiddenException(LOCALE.BLOCKED_REQUEST);
    }

    return allowedUserAgent;
  }
}
