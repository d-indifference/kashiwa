import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { PinoLogger } from 'nestjs-pino';
import { LOCALE } from '@locale/locale';

/**
 * Service for protecting API endpoints by validating user existence
 */
@Injectable()
export class ProtectApiProvider {
  constructor(
    private readonly userPersistenceService: UserPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ProtectApiProvider.name);
  }

  /**
   * Validates that a user with the given ID exists
   * @param userId The ID of the user to validate
   */
  public async protect(userId: string): Promise<void> {
    this.logger.debug({ userId }, 'protect');

    const user = await this.userPersistenceService.findByIdStrict(userId);

    if (user) {
      return;
    }

    throw new ForbiddenException(LOCALE.NO_PERMISSION_TO_ACCESS);
  }
}
