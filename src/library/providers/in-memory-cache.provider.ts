import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class InMemoryCacheProvider {
  private readonly cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  public del(key: string): void {
    this.cache.del(key);
  }

  public flush(): void {
    this.cache.flushAll();
  }
}
