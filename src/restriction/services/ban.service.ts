import { ForbiddenException, Injectable } from '@nestjs/common';
import { BanPersistenceService } from '@persistence/services';
import { BanDto } from '@persistence/dto/ban';
import { LOCALE } from '@locale/locale';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for ban restrictions
 */
@Injectable()
export class BanService {
  constructor(
    private readonly banPersistenceService: BanPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(BanService.name);
  }

  /**
   * Check if non-admin user has an actual ban. If the ban is actual, throws 403
   * @param ip Poster's IP
   * @param isAdmin Check if user is admin
   * @param boardUrl Board URL
   */
  public async checkBan(ip: string, isAdmin: boolean, boardUrl: string): Promise<void> {
    this.logger.debug({ ip, isAdmin, boardUrl }, 'checkBan');

    if (!isAdmin) {
      const ban = await this.banPersistenceService.getCurrentBan(ip);

      if (ban) {
        if (!ban.boardUrl || ban.boardUrl === boardUrl) {
          throw new ForbiddenException(this.makeBanMessage(ban));
        }
      }
    }
  }

  /**
   * Returns localized ban message string
   */
  private makeBanMessage(dto: BanDto): string {
    return (LOCALE['YOU_HAVE_BEEN_BANNED'] as CallableFunction)(dto.till.toLocaleDateString(), dto.reason);
  }
}
