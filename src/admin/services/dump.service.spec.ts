/* eslint-disable @typescript-eslint/ban-ts-comment */

import { DumpService } from './dump.service';
import { DatabaseDumpingUtilsProvider } from '@admin/providers';
import { FileSystemProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { ISession } from '@admin/interfaces';
import { Cookie } from 'express-session';
import { UserRole } from '@prisma/client';
import { DumpForm } from '@admin/forms';
import { Response } from 'express';
import { Dirent } from 'fs-extra';
import { sep } from 'path';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

jest.mock('archiver', () => () => ({
  pipe: jest.fn(),
  file: jest.fn(),
  directory: jest.fn(),
  finalize: jest.fn().mockResolvedValue(undefined),
  on: jest.fn()
}));

jest.mock('node:fs', () => ({
  createWriteStream: jest.fn(() => ({
    on: jest.fn()
  }))
}));

describe('DumpService', () => {
  let service: DumpService;
  let config: jest.Mocked<ConfigService>;
  let databaseDumpingUtils: jest.Mocked<DatabaseDumpingUtilsProvider>;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let logger: jest.Mocked<PinoLogger>;
  let mockRes: any;

  beforeEach(() => {
    config = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'file-storage.path') {
          return `${path.sep}app${path.sep}volume`;
        }
        throw new Error(`Unexpected config key: ${key}`);
      })
    } as any;
    databaseDumpingUtils = {
      dumpSql: jest.fn()
    } as any;
    fileSystem = {
      readDir: jest.fn(),
      removePathOutOfVolume: jest.fn().mockResolvedValue(undefined)
    } as any;
    logger = {
      setContext: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    } as any;
    service = new DumpService(databaseDumpingUtils, fileSystem, logger, config);
    mockRes = { redirect: jest.fn() };
    process.env['npm_package_version'] = '1.0.0';
  });

  describe('getForm', () => {
    it('should return RenderableSessionFormPage with default form', () => {
      const session: ISession = { cookie: {} as Cookie, payload: { id: '1', role: UserRole.ADMINISTRATOR } };
      const result = service.getForm(session);
      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('commons');
      expect(result).toHaveProperty('form');
    });
  });

  describe('processDump', () => {
    it('should process dump and redirect', async () => {
      const form = { dbTable: ['user'], additional: ['cache', 'settings'] } as any;
      const sqlDumps = ['/tmp/kashiwa-db/user.sql'];
      const dirDumps = ['/app/cache', '/app/settings'];
      databaseDumpingUtils.dumpSql.mockResolvedValue(sqlDumps);
      jest.spyOn(service as any, 'getCacheForArchivation').mockResolvedValue(dirDumps);
      jest.spyOn(service as any, 'zipFiles').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'afterArchiving').mockResolvedValue(undefined);

      await service.processDump(form as DumpForm, mockRes as Response);

      expect(databaseDumpingUtils.dumpSql).toHaveBeenCalledWith(form.dbTable);
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/dump');
    });
  });

  describe('makeFullDumpArchivePath', () => {
    it('should return correct archive path', () => {
      const targetPath = '/app';
      const result = (service as any).makeFullDumpArchivePath(targetPath);
      expect(result).toMatch(/kashiwa-v1.0.0-dump-\d+\.zip/);
    });
  });

  describe('getCacheForArchivation', () => {
    it('should return filtered directories for archivation', async () => {
      const form = { additional: ['cache', 'settings'] } as any;
      const direntMock = (name: string, isDir = true) => ({
        name,
        isDirectory: () => isDir
      });
      fileSystem.readDir.mockResolvedValue([
        direntMock('cache') as Dirent,
        direntMock('settings') as Dirent,
        direntMock('file.txt', false) as Dirent
      ]);
      const result = await (service as any).getCacheForArchivation(form);
      expect(result).toEqual(
        expect.arrayContaining([`${sep}app${sep}volume${sep}cache`, `${sep}app${sep}volume${sep}settings`])
      );
    });
  });

  describe('cacheFilterPredicate', () => {
    it('should filter only directories and respect additional settings', () => {
      const form = { additional: ['cache'] } as any;
      const direntMock = (name: string, isDir = true) => ({
        name,
        isDirectory: () => isDir
      });
      // @ts-ignore
      expect((service as any).cacheFilterPredicate(form, direntMock('settings'))).toBe(true);
      // @ts-ignore
      expect((service as any).cacheFilterPredicate(form, direntMock('cache'))).toBe(true);
      // @ts-ignore
      expect((service as any).cacheFilterPredicate(form, direntMock('file.txt', false))).toBe(false);
    });
  });

  describe('afterArchiving', () => {
    it('should remove temp db dir', async () => {
      await (service as any).afterArchiving();
      expect(fileSystem.removePathOutOfVolume).toHaveBeenCalledWith('/tmp/kashiwa-db');
    });
  });
});
