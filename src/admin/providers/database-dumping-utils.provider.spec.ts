/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/ban-ts-comment */

jest.mock('node:util', () => ({
  promisify: () => execAsyncMock
}));

jest.mock('child_process');
jest.mock('node:path', () => require('path'));

import { DatabaseDumpingUtilsProvider } from './database-dumping-utils.provider';
import { FileSystemProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { InternalServerErrorException } from '@nestjs/common';

const execAsyncMock = jest.fn();

describe('DatabaseDumpingUtilsProvider', () => {
  let provider: DatabaseDumpingUtilsProvider;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(() => {
    fileSystem = {
      ensureDirOutOfVolume: jest.fn().mockResolvedValue(undefined)
    } as any;
    logger = {
      setContext: jest.fn(),
      info: jest.fn()
    } as any;
    provider = new DatabaseDumpingUtilsProvider(fileSystem, logger);
    execAsyncMock.mockReset();
  });

  describe('getTableNamesFromKeywords', () => {
    it('should map keywords to correct table names', () => {
      const result = provider['getTableNamesFromKeywords'](['ban', 'board', 'user']);
      expect(result).toEqual(expect.arrayContaining(['ban', 'board', 'board_settings', 'user']));
    });
    it('should return empty array for unknown keywords', () => {
      const result = provider['getTableNamesFromKeywords'](['unknown']);
      expect(result).toEqual([]);
    });
  });

  describe('dumpSql', () => {
    it('should call dumpTable for each resolved table', async () => {
      const spy = jest.spyOn<any, any>(provider as any, 'dumpTable').mockResolvedValue('file1.sql');
      // @ts-ignore
      jest.spyOn(provider, 'getTableNamesFromKeywords').mockReturnValue(['table1', 'table2']);
      const result = await provider.dumpSql(['board']);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['file1.sql', 'file1.sql']);
    });
  });

  describe('dumpTable', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db?schema=public';
    });

    it('should create dir, run pg_dump and return file path', async () => {
      execAsyncMock.mockResolvedValue({ stdout: '', stderr: '' });
      const ensureDirSpy = fileSystem.ensureDirOutOfVolume;
      const runPgDumpSpy = jest.spyOn<any, any>(provider as any, 'runPgDump');
      const table = 'board';
      const result = await (provider as any).dumpTable(table);
      expect(ensureDirSpy).toHaveBeenCalled();
      expect(runPgDumpSpy).toHaveBeenCalled();
      expect(result).toMatch(/kashiwa-board-.*\.sql$/);
    });
  });

  describe('getDatabaseConnectionString', () => {
    it('should return connection string without query params', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db?schema=public';
      // @ts-ignore
      expect(provider.getDatabaseConnectionString()).toBe('postgres://user:pass@localhost:5432/db');
    });
    it('should throw if DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      // @ts-ignore
      expect(() => provider.getDatabaseConnectionString()).toThrow(InternalServerErrorException);
    });
  });

  describe('toDumpFilePath', () => {
    it('should return correct temp path', () => {
      // @ts-ignore
      expect(provider.toDumpFilePath()).toMatch(/kashiwa-db/);
    });
  });

  describe('getDumpFileName', () => {
    it('should return file name with table and timestamp', () => {
      // @ts-ignore
      const name = provider.getDumpFileName('board');
      expect(name).toMatch(/kashiwa-board-\d+\.sql/);
    });
  });

  describe('runPgDump', () => {
    beforeEach(() => {
      execAsyncMock.mockReset();
    });
    it('should call execAsync with correct command', async () => {
      execAsyncMock.mockResolvedValue({ stdout: '', stderr: '' });
      const conn = 'postgres://user:pass@localhost:5432/db';
      const out = '/tmp/file.sql';
      await (provider as any).runPgDump(conn, out, ['--data-only']);
      expect(execAsyncMock).toHaveBeenCalledWith(expect.stringContaining('pg_dump'));
      expect(execAsyncMock).toHaveBeenCalledWith(expect.stringContaining('--data-only'));
      expect(execAsyncMock).toHaveBeenCalledWith(expect.stringContaining(conn));
      expect(execAsyncMock).toHaveBeenCalledWith(expect.stringContaining(out));
    });
    it('should throw InternalServerErrorException on error', async () => {
      execAsyncMock.mockRejectedValue('fail');
      await expect((provider as any).runPgDump('c', 'o', [])).rejects.toThrow(InternalServerErrorException);
    });
  });
});
