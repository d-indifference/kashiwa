/* eslint-disable require-await */

jest.mock('node:util', () => ({
  promisify: () => execAsyncMock
}));

jest.mock('child_process');

import { DashboardUtilsProvider } from './dashboard-utils.provider';
import { PrismaService } from '@persistence/lib';
import { LOCALE } from '@locale/locale';
import { InMemoryCacheProvider } from '@library/providers';

const execAsyncMock = jest.fn();

describe('DashboardUtilsProvider', () => {
  let provider: DashboardUtilsProvider;
  let prisma: jest.Mocked<PrismaService>;
  let cache: jest.Mocked<InMemoryCacheProvider>;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn()
    } as any;

    cache = {
      getOrCache: jest.fn()
    } as any;

    provider = new DashboardUtilsProvider(prisma, cache);
    execAsyncMock.mockReset();
  });

  describe('getPostgresVersion', () => {
    it('should return postgres version from cache', async () => {
      cache.getOrCache.mockResolvedValue('cached-version');
      const version = await provider.getPostgresVersion();
      expect(version).toBe('cached-version');
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should return postgres version from query if not cached', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      prisma.$queryRaw.mockResolvedValue([{ version: 'PostgreSQL 15.0' }]);
      const version = await provider.getPostgresVersion();
      expect(version).toBe('PostgreSQL 15.0');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getImageMagickVersion', () => {
    it('should return version from cache', async () => {
      cache.getOrCache.mockResolvedValue('cached-magick');
      const version = await provider.getImageMagickVersion();
      expect(version).toBe('cached-magick');
      expect(execAsyncMock).not.toHaveBeenCalled();
    });

    it('should parse version via exec if not cached', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      execAsyncMock.mockResolvedValue({ stdout: 'Version: 7.1.0-19 https://imagemagick.org\nOther info' });
      const version = await provider.getImageMagickVersion();
      expect(version).toBe('7.1.0-19');
      expect(execAsyncMock).toHaveBeenCalledWith('convert --version');
    });
  });

  describe('getPgDumpVersion', () => {
    it('should return version from cache', async () => {
      cache.getOrCache.mockResolvedValue('cached-pgdump');
      const version = await provider.getPgDumpVersion();
      expect(version).toBe('cached-pgdump');
    });

    it('should parse version via exec if not cached', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      execAsyncMock.mockResolvedValue({ stdout: 'pg_dump (PostgreSQL) 15.0\n' });
      const version = await provider.getPgDumpVersion();
      expect(version).toBe('pg_dump (PostgreSQL) 15.0');
      expect(execAsyncMock).toHaveBeenCalledWith('pg_dump --version');
    });
  });

  describe('getZipVersion', () => {
    it('should return version from cache', async () => {
      cache.getOrCache.mockResolvedValue('cached-zip');
      const version = await provider.getZipVersion();
      expect(version).toBe('cached-zip');
    });

    it('should parse version via exec if not cached', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      execAsyncMock.mockResolvedValue({ stdout: 'This is Zip 3.0 (July 5th 2008)\nCopyright...' });
      const version = await provider.getZipVersion();
      expect(version).toBe('3.0');
      expect(execAsyncMock).toHaveBeenCalledWith('zip --version');
    });
  });

  describe('getFfMpegVersion', () => {
    it('should return version from cache', async () => {
      cache.getOrCache.mockResolvedValue('cached-ffmpeg');
      const version = await provider.getFfMpegVersion();
      expect(version).toBe('cached-ffmpeg');
    });

    it('should parse version via exec if not cached', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      execAsyncMock.mockResolvedValue({ stdout: 'ffmpeg version 6.0 Copyright' });
      const version = await provider.getFfMpegVersion();
      expect(version).toBe('6.0');
      expect(execAsyncMock).toHaveBeenCalledWith('ffmpeg -version');
    });
  });

  describe('getToolVersion', () => {
    it('should return formatted version on success', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'This is Zip 3.0\n' });
      const cb = (stdout: string) => stdout.split(' ')[3].trim();
      const result = await provider['getToolVersion']('zip --version', 'FAILED_ZIP_VERSION', cb);
      expect(result).toBe('3.0');
    });

    it('should return error message on failure', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'command not found', message: 'fail' });
      const cb = (stdout: string) => stdout;
      const result = await provider['getToolVersion']('zip --version', 'FAILED_ZIP_VERSION', cb);
      expect(result).toContain(LOCALE['FAILED_ZIP_VERSION']);
      expect(result).toContain('command not found');
    });
  });
});
