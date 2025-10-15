import { ForbiddenException, Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { LOCALE } from '@locale/locale';

/**
 * In-memory cache provider.
 * Designed for storing runtime application data such as site settings,
 * IP blacklists, and spam lists.
 */
@Injectable()
export class InMemoryCacheProvider {
  private readonly cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
  }

  /**
   * Retrieves a value from the cache by key.
   * @param key The key of the cached value
   */
  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Retrieves a value from the cache by key, or stores and returns
   * the result of an async callback if the value is missing.
   * @param key The key of the cached value
   * @param callback An async function that provides the value if not cached
   */
  public async getOrCache<T>(key: string, callback: () => Promise<T>): Promise<T> {
    const value = this.get<T>(key);

    if (!value) {
      const valueFromCallback = await callback();
      this.set<T>(key, valueFromCallback);

      return valueFromCallback;
    }

    return value;
  }

  /**
   * Retrieves a value from the cache by key, or stores and returns
   * the result of a sync callback if the value is missing.
   * @param key The key of the cached value
   * @param callback A sync function that provides the value if not cached
   */
  public getOrCacheSync<T>(key: string, callback: () => T): T {
    const value = this.get<T>(key);

    if (!value) {
      const valueFromCallback = callback();
      this.set<T>(key, valueFromCallback);

      return valueFromCallback;
    }

    return value;
  }

  /**
   * Stores a value in the cache under the given key.
   * @param key The key to associate with the value
   * @param value The value to store in the cache
   */
  public set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  /**
   * Removes a value from the cache by key.
   * @param key The key of the cached value to delete
   */
  public del(key: string): void {
    this.cache.del(key);
  }

  /**
   * Removes many values by keys with the same start pattern
   * @param keyFragment Starting fragment of removed keys
   */
  public delKeyStartWith(keyFragment: string): void {
    const availableKeys = this.cache.keys().filter(key => key.startsWith(keyFragment));
    this.cache.del(availableKeys);
  }

  /**
   * **(*NB*: PLEASE USE IT ONLY IN DEVELOPMENT MODE. IT IS NOT FOR PRODUCTION!!!)**<br>
   * Get all cache contents at the current moment
   */
  public dumpCache(): object {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(LOCALE['OPERATION_ONLY_FOR_DEVELOPMENT']);
    }

    return this.cache.mget(this.cache.keys());
  }

  /**
   * Clears all entries from the cache.
   */
  public flush(): void {
    this.cache.flushAll();
  }
}
