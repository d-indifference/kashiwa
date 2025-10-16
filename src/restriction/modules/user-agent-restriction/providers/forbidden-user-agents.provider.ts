import { Injectable } from '@nestjs/common';
import { SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';

@Injectable()
export class ForbiddenUserAgentsProvider {
  constructor(
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ForbiddenUserAgentsProvider.name);
  }

  public checkUserAgent(req: Request, isAdmin: boolean): boolean {
    const userAgent = req.get('user-agent') ?? '';
    this.logger.debug({ userAgent, isAdmin }, 'checkUserAgent');

    if (isAdmin) {
      return true;
    }

    const regExps = this.siteContext.getForbiddenUserAgents() ?? [];

    for (const regex of regExps) {
      if (regex.test(userAgent)) {
        return false;
      }
    }

    return true;
  }
}
