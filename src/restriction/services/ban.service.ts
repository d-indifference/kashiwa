import { ForbiddenException, Injectable } from '@nestjs/common';
import { BanPersistenceService } from '@persistence/services';
import { BanDto } from '@persistence/dto/ban';
import { LOCALE } from '@locale/locale';

/**
 * Service for ban restrictions
 */
@Injectable()
export class BanService {
  constructor(private readonly banPersistenceService: BanPersistenceService) {}

  /**
   * Check if non-admin user has an actual ban. If the ban is actual, throws 403
   * @param ip Poster's IP
   * @param isAdmin Check if user is admin
   */
  public async checkBan(ip: string, isAdmin: boolean): Promise<void> {
    if (!isAdmin) {
      const ban = await this.banPersistenceService.getCurrentBan(ip);

      if (ban) {
        throw new ForbiddenException(this.makeBanMessage(ban));
      }
    }
  }

  private makeBanMessage(dto: BanDto): string {
    return (LOCALE['YOU_HAVE_BEEN_BANNED'] as CallableFunction)(dto.till.toLocaleDateString(), dto.reason);
  }
}
