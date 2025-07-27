import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InMemoryCacheProvider } from '@library/providers/in-memory-cache.provider';
import { GlobalSettingsForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';

const KEY_GLOBAL_SETTINGS = 'KEY_GLOBAL_SETTINGS';
const KEY_SPAM_EXPRESSIONS = 'KEY_SPAM_EXPRESSIONS';
const KEY_IP_BLACK_LIST = 'KEY_IP_BLACK_LIST';

@Injectable()
export class SiteContextProvider {
  constructor(private readonly inMemoryCache: InMemoryCacheProvider) {}

  public getGlobalSettings(): GlobalSettingsForm {
    return this.get(KEY_GLOBAL_SETTINGS, 'GLOBAL_SETTINGS_NOT_FOUND');
  }

  public setGlobalSettings(val: GlobalSettingsForm): void {
    this.inMemoryCache.set(KEY_GLOBAL_SETTINGS, val);
  }

  public getSpamExpressions(): string[] | undefined {
    return this.inMemoryCache.get<string[]>(KEY_SPAM_EXPRESSIONS);
  }

  public setSpamExpressions(val: string[]): void {
    this.inMemoryCache.set(KEY_SPAM_EXPRESSIONS, val);
  }

  public getIpBlackList(): string[] | undefined {
    return this.inMemoryCache.get<string[]>(KEY_IP_BLACK_LIST);
  }

  public setIpBlackList(val: string[]): void {
    this.inMemoryCache.set(KEY_IP_BLACK_LIST, val);
  }

  private get<T>(key: string, errorLocaleKey: string): T {
    const val = this.inMemoryCache.get<T>(key);

    if (!val) {
      throw new InternalServerErrorException(LOCALE[errorLocaleKey] as string);
    }

    return val;
  }
}
