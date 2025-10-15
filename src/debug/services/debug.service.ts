import { Injectable } from '@nestjs/common';
import { InMemoryCacheProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';

/**
 * A service for performing certain operations that may be required only in development mode
 * NB: For future contributors: PLEASE ADD HERE ONLY THOSE METHODS THAT SHOULD NOT BE IN PRODUCTION!!!
 */
@Injectable()
export class DebugService {
  constructor(
    private readonly inMemoryCacheProvider: InMemoryCacheProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(DebugService.name);
  }

  /**
   * Get all cache contents at the current moment
   */
  public dumpInMemoryCache(): object {
    this.logger.debug('dumpInMemoryCache');
    const cache = this.inMemoryCacheProvider.dumpCache();
    this.logger.debug(cache, 'cache dumped');

    return cache;
  }
}
