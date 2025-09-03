import { CacheCronOperationsProvider } from './cache-cron-operations.provider';

describe('CacheCronOperationsProvider', () => {
  let cache: any;
  let provider: CacheCronOperationsProvider;

  beforeEach(() => {
    cache = {
      delKeyStartWith: jest.fn()
    } as any;
    provider = new CacheCronOperationsProvider(cache);
  });

  describe('clearCachedPosts', () => {
    it('should call cache.delKeyStartWith with "api."', () => {
      provider.clearCachedPosts();
      expect(cache.delKeyStartWith).toHaveBeenCalledWith('api.');
    });
  });
});
