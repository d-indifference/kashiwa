jest.mock('node:util', () => ({
  promisify: () => execAsyncMock
}));

jest.mock('child_process');

import { DashboardUtilsProvider } from './dashboard-utils.provider';
import { PrismaService } from '@persistence/lib';
import { LOCALE } from '@locale/locale';

const execAsyncMock = jest.fn();

describe('DashboardUtilsProvider', () => {
  let provider: DashboardUtilsProvider;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn()
    } as any;
    provider = new DashboardUtilsProvider(prisma);
    execAsyncMock.mockReset();
  });

  describe('getPostgresVersion', () => {
    it('should return postgres version from query', async () => {
      prisma.$queryRaw.mockResolvedValue([{ version: 'PostgreSQL 15.0' }]);
      const version = await provider.getPostgresVersion();
      expect(version).toBe('PostgreSQL 15.0');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getImageMagickVersion', () => {
    it('should parse ImageMagick version from stdout', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'Version: 7.1.0-19 https://imagemagick.org\nOther info' });
      const version = await provider.getImageMagickVersion();
      expect(version).toBe('7.1.0-19');
      expect(execAsyncMock).toHaveBeenCalledWith('convert --version');
    });

    it('should return error message if exec fails', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'not found', message: 'fail' });
      const version = await provider.getImageMagickVersion();
      expect(version).toContain(LOCALE['FAILED_IMAGEMAGICK_VERSION']);
      expect(version).toContain('not found');
    });
  });

  describe('getPgDumpVersion', () => {
    it('should parse pg_dump version from stdout', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'pg_dump (PostgreSQL) 15.0\n' });
      const version = await provider.getPgDumpVersion();
      expect(version).toBe('pg_dump (PostgreSQL) 15.0');
      expect(execAsyncMock).toHaveBeenCalledWith('pg_dump --version');
    });

    it('should return error message if exec fails', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'not found', message: 'fail' });
      const version = await provider.getPgDumpVersion();
      expect(version).toContain(LOCALE['FAILED_PG_DUMP_VERSION']);
      expect(version).toContain('not found');
    });
  });

  describe('getZipVersion', () => {
    it('should parse zip version from stdout', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'This is Zip 3.0 (July 5th 2008)\nCopyright (c) 1990-2008 Info-ZIP.' });
      const version = await provider.getZipVersion();
      expect(version).toBe('3.0');
      expect(execAsyncMock).toHaveBeenCalledWith('zip --version');
    });

    it('should return unknown version if regex does not match', async () => {
      execAsyncMock.mockResolvedValue({ stdout: 'No version info here' });
      const version = await provider.getZipVersion();
      expect(version).toBe('unknown version');
    });

    it('should return error message if exec fails', async () => {
      execAsyncMock.mockRejectedValue({ stderr: 'not found', message: 'fail' });
      const version = await provider.getZipVersion();
      expect(version).toContain(LOCALE['FAILED_ZIP_VERSION']);
      expect(version).toContain('not found');
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
