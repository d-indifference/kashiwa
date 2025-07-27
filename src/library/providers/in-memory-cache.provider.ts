import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

/**
 * In-memory cache provider using node-cache.
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
   * Clears all entries from the cache.
   */
  public flush(): void {
    this.cache.flushAll();
  }
}
