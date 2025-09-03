/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable require-await */

import { InMemoryCacheProvider } from './in-memory-cache.provider';
import * as NodeCache from 'node-cache';

jest.mock('node-cache');

describe('InMemoryCacheProvider', () => {
  let provider: InMemoryCacheProvider;
  let cacheMock: jest.Mocked<NodeCache>;

  beforeEach(() => {
    // @ts-ignore
    cacheMock = new NodeCache() as jest.Mocked<NodeCache>;
    (NodeCache as unknown as jest.Mock).mockImplementation(() => cacheMock);
    provider = new InMemoryCacheProvider();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should call cache.get on get()', () => {
    cacheMock.get.mockReturnValueOnce('value');
    const result = provider.get<string>('key');
    expect(cacheMock.get).toHaveBeenCalledWith('key');
    expect(result).toBe('value');
  });

  it('should call cache.set on set()', () => {
    provider.set('key', 'value');
    expect(cacheMock.set).toHaveBeenCalledWith('key', 'value');
  });

  it('should call cache.del on del()', () => {
    provider.del('key');
    expect(cacheMock.del).toHaveBeenCalledWith('key');
  });

  it('should call cache.flushAll on flush()', () => {
    provider.flush();
    expect(cacheMock.flushAll).toHaveBeenCalled();
  });

  describe('getOrCacheSync', () => {
    it('should return cached value if present', () => {
      cacheMock.get.mockReturnValueOnce('cached');
      const callback = jest.fn(() => 'new-value');

      const result = provider.getOrCacheSync('key', callback);

      expect(result).toBe('cached');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback and cache value if not present', () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      const callback = jest.fn(() => 'computed');

      const result = provider.getOrCacheSync('key', callback);

      expect(result).toBe('computed');
      expect(callback).toHaveBeenCalled();
      expect(cacheMock.set).toHaveBeenCalledWith('key', 'computed');
    });
  });

  describe('getOrCache', () => {
    it('should return cached value if present', async () => {
      cacheMock.get.mockReturnValueOnce('cached');
      const callback = jest.fn(async () => 'new-value');

      const result = await provider.getOrCache('key', callback);

      expect(result).toBe('cached');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callback and cache value if not present', async () => {
      cacheMock.get.mockReturnValueOnce(undefined);
      const callback = jest.fn(async () => 'computed');

      const result = await provider.getOrCache('key', callback);

      expect(result).toBe('computed');
      expect(callback).toHaveBeenCalled();
      expect(cacheMock.set).toHaveBeenCalledWith('key', 'computed');
    });
  });

  describe('delKeyStartWith', () => {
    it('should delete all keys starting with the given fragment', () => {
      cacheMock.keys.mockReturnValue(['api.1', 'api.2', 'other.1']);
      cacheMock.del.mockReturnValue(2);

      provider.delKeyStartWith('api.');

      expect(cacheMock.keys).toHaveBeenCalled();
      expect(cacheMock.del).toHaveBeenCalledWith(['api.1', 'api.2']);
    });

    it('should do nothing if no keys match the fragment', () => {
      cacheMock.keys.mockReturnValue(['foo.1', 'bar.2']);
      cacheMock.del.mockReturnValue(0);

      provider.delKeyStartWith('zzz.');

      expect(cacheMock.keys).toHaveBeenCalled();
      expect(cacheMock.del).toHaveBeenCalledWith([]);
    });
  });
});
