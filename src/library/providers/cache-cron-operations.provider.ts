import { Injectable } from '@nestjs/common';
import { InMemoryCacheProvider } from '@library/providers/in-memory-cache.provider';
import { Cron } from '@nestjs/schedule';
import { Constants } from '@library/constants';

@Injectable()
export class CacheCronOperationsProvider {
  constructor(private readonly cache: InMemoryCacheProvider) {}

  @Cron(Constants.POST_CLEARING_INTERVAL)
  public clearCachedPosts(): void {
    this.cache.delKeyStartWith('api.');
  }
}
