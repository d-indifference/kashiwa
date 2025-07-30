import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InMemoryCacheProvider } from '@library/providers/in-memory-cache.provider';
import { GlobalSettingsForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';

const KEY_GLOBAL_SETTINGS = 'KEY_GLOBAL_SETTINGS';
const KEY_SPAM_EXPRESSIONS = 'KEY_SPAM_EXPRESSIONS';
const KEY_IP_BLACK_LIST = 'KEY_IP_BLACK_LIST';

/**
 * Provider that manages global site-related runtime data in memory,
 * including global settings, spam expressions, and IP blacklists.
 */
@Injectable()
export class SiteContextProvider {
  constructor(private readonly inMemoryCache: InMemoryCacheProvider) {}

  /**
   * Retrieves global site settings from memory.
   * Throws an internal server error if settings are not found.
   */
  public getGlobalSettings(): GlobalSettingsForm {
    return this.get(KEY_GLOBAL_SETTINGS, 'GLOBAL_SETTINGS_NOT_FOUND');
  }

  /**
   * Stores global site settings in memory.
   * @param val The global settings to store
   */
  public setGlobalSettings(val: GlobalSettingsForm): void {
    this.inMemoryCache.set(KEY_GLOBAL_SETTINGS, val);
  }

  /**
   * Retrieves the list of spam expressions from memory.
   */
  public getSpamExpressions(): string[] | undefined {
    return this.inMemoryCache.get<string[]>(KEY_SPAM_EXPRESSIONS);
  }

  /**
   * Stores the list of spam expressions in memory.
   * @param val The list of spam expressions to store
   */
  public setSpamExpressions(val: string[]): void {
    this.inMemoryCache.set(KEY_SPAM_EXPRESSIONS, val);
  }

  /**
   * Retrieves the IP blacklist from memory.
   */
  public getIpBlackList(): string[] | undefined {
    return this.inMemoryCache.get<string[]>(KEY_IP_BLACK_LIST);
  }

  /**
   * Stores the IP blacklist in memory.
   * @param val The list of blacklisted IPs to store
   */
  public setIpBlackList(val: string[]): void {
    this.inMemoryCache.set(KEY_IP_BLACK_LIST, val);
  }

  /**
   * Retrieves a value from memory cache by key.
   * Throws an error if the value is not found.
   */
  private get<T>(key: string, errorLocaleKey: string): T {
    const val = this.inMemoryCache.get<T>(key);

    if (!val) {
      throw new InternalServerErrorException(LOCALE[errorLocaleKey] as string);
    }

    return val;
  }
}
