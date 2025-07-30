import { CachingProvider } from './caching.provider';
import { CachingUpdateProvider } from './caching.update.provider';
import { FileSystemProvider } from '@library/providers';
import { Constants } from '@library/constants';

describe('CachingProvider', () => {
  let provider: CachingProvider;
  let cachingUpdateProvider: jest.Mocked<CachingUpdateProvider>;
  let fileSystem: jest.Mocked<FileSystemProvider>;

  beforeEach(() => {
    cachingUpdateProvider = {
      fullyReloadCache: jest.fn(),
      reloadCacheForThread: jest.fn()
    } as any;
    fileSystem = {
      ensureDir: jest.fn(),
      removePath: jest.fn(),
      readDir: jest.fn(),
      emptyDir: jest.fn(),
      renameDir: jest.fn()
    } as any;
    provider = new CachingProvider(cachingUpdateProvider, fileSystem);
  });

  describe('createCache', () => {
    it('should create cache directories and reload cache', async () => {
      fileSystem.ensureDir.mockResolvedValue(undefined);

      cachingUpdateProvider.fullyReloadCache.mockResolvedValue(undefined);
      await provider.createCache('b');
      expect(fileSystem.ensureDir).toHaveBeenCalledWith(['b']);
      expect(fileSystem.ensureDir).toHaveBeenCalledWith(['b', Constants.SRC_DIR]);
      expect(fileSystem.ensureDir).toHaveBeenCalledWith(['b', Constants.RES_DIR]);
      expect(fileSystem.ensureDir).toHaveBeenCalledWith(['b', Constants.THUMB_DIR]);
      expect(cachingUpdateProvider.fullyReloadCache).toHaveBeenCalledWith('b');
    });
  });

  describe('clearCache', () => {
    it('should empty directories and remove files', async () => {
      fileSystem.emptyDir.mockResolvedValue(undefined);
      fileSystem.readDir.mockResolvedValue([]);
      await provider.clearCache('b');
      expect(fileSystem.emptyDir).toHaveBeenCalledWith(['b', Constants.RES_DIR]);
      expect(fileSystem.emptyDir).toHaveBeenCalledWith(['b', Constants.SRC_DIR]);
      expect(fileSystem.emptyDir).toHaveBeenCalledWith(['b', Constants.THUMB_DIR]);
      expect(fileSystem.readDir).toHaveBeenCalledWith(['b']);
    });
  });

  describe('renameCache', () => {
    it('should rename directory', async () => {
      fileSystem.renameDir.mockResolvedValue(undefined);
      await provider.renameCache('old', 'new');
      expect(fileSystem.renameDir).toHaveBeenCalledWith(['old'], ['new']);
    });
  });

  describe('removeCache', () => {
    it('should remove directory', async () => {
      fileSystem.removePath.mockResolvedValue(undefined);
      await provider.removeCache('b');
      expect(fileSystem.removePath).toHaveBeenCalledWith(['b']);
    });
  });

  describe('fullyReloadCache', () => {
    it('should remove files, empty res dir and reload cache', async () => {
      fileSystem.readDir.mockResolvedValue([]);
      fileSystem.emptyDir.mockResolvedValue(undefined);
      cachingUpdateProvider.fullyReloadCache.mockResolvedValue(undefined);
      await provider.fullyReloadCache('b');
      expect(fileSystem.readDir).toHaveBeenCalledWith(['b']);
      expect(fileSystem.emptyDir).toHaveBeenCalledWith(['b', Constants.RES_DIR]);
      expect(cachingUpdateProvider.fullyReloadCache).toHaveBeenCalledWith('b');
    });
  });

  describe('reloadCacheForThread', () => {
    it('should reload cache for thread', async () => {
      cachingUpdateProvider.reloadCacheForThread.mockResolvedValue(undefined);
      await provider.reloadCacheForThread('b', 123n);
      expect(cachingUpdateProvider.reloadCacheForThread).toHaveBeenCalledWith('b', 123n);
    });
  });

  describe('removeThreadPage', () => {
    it('should remove thread page file', async () => {
      fileSystem.removePath.mockResolvedValue(undefined);
      await provider.removeThreadPage('b', 123n);
      expect(fileSystem.removePath).toHaveBeenCalledWith(['b', Constants.RES_DIR, `123.${Constants.HTML_SUFFIX}`]);
    });
  });
});
