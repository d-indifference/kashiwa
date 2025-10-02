/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable require-await */

import { DashboardService } from './dashboard.service';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { DashboardUtilsProvider } from '@admin/providers';
import { FileSystemProvider, InMemoryCacheProvider } from '@library/providers';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ISession } from '@admin/interfaces';
import { PinoLogger } from 'nestjs-pino';
import { Params } from 'nestjs-pino/params';

describe('DashboardService', () => {
  let service: DashboardService;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let utils: jest.Mocked<DashboardUtilsProvider>;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let cache: jest.Mocked<InMemoryCacheProvider>;
  let mockSession: any;
  let mockReq: any;

  beforeEach(() => {
    boardPersistenceService = { countAll: jest.fn() } as any;
    commentPersistenceService = { countAll: jest.fn() } as any;
    utils = {
      getPostgresVersion: jest.fn(),
      getImageMagickVersion: jest.fn(),
      getFfMpegVersion: jest.fn(),
      getPgDumpVersion: jest.fn(),
      getZipVersion: jest.fn()
    } as any;
    fileSystem = {
      dirSize: jest.fn(),
      readTextFileOutOfVolume: jest.fn()
    } as any;
    cache = {
      getOrCacheSync: jest.fn(),
      getOrCache: jest.fn()
    } as any;

    service = new DashboardService(
      boardPersistenceService,
      commentPersistenceService,
      utils,
      fileSystem,
      cache,
      new PinoLogger({} as Params)
    );

    mockSession = { payload: { role: UserRole.ADMINISTRATOR } };
    mockReq = { headers: { host: 'localhost:3000' } };
  });

  it('should aggregate dashboard data and return DashboardPage', async () => {
    boardPersistenceService.countAll.mockResolvedValue(2);
    commentPersistenceService.countAll.mockResolvedValue(10);
    fileSystem.dirSize.mockResolvedValue(12345);
    fileSystem.readTextFileOutOfVolume.mockResolvedValue(
      JSON.stringify({
        dependencies: { express: '^4.0.0' },
        devDependencies: { jest: '^29.0.0' }
      })
    );
    utils.getPostgresVersion.mockResolvedValue('PostgreSQL 15.0');
    utils.getImageMagickVersion.mockResolvedValue('7.1.0-19');
    utils.getFfMpegVersion.mockResolvedValue('7.1.0-19');
    utils.getPgDumpVersion.mockResolvedValue('pg_dump (PostgreSQL) 15.0');
    utils.getZipVersion.mockResolvedValue('3.0');

    cache.getOrCacheSync.mockImplementation((_key, cb) => cb());
    cache.getOrCache.mockImplementation(async (_key, cb) => cb());

    jest.spyOn(process, 'cwd').mockReturnValue('/fake');
    process.env['npm_package_version'] = '1.2.3';
    Object.defineProperty(process, 'debugPort', { value: 9229 });
    Object.defineProperty(process, 'versions', { value: { node: '20.0.0' } });
    jest.spyOn(require('os'), 'totalmem').mockReturnValue(1000);
    jest.spyOn(require('os'), 'freemem').mockReturnValue(400);
    jest.spyOn(require('os'), 'uptime').mockReturnValue(123);
    jest.spyOn(require('os'), 'cpus').mockReturnValue([{ model: 'FakeCPU' }]);
    jest.spyOn(require('os'), 'hostname').mockReturnValue('test_host');

    const result = await service.getDashboardPage(mockReq as Request, mockSession as ISession);

    expect(result.totalBoards).toBe(2);
    expect(result.totalComments).toBe(10);
    expect(result.diskSpaceUsed).toBe(12345);
    expect(result.dependencies).toEqual({ express: '^4.0.0' });
    expect(result.devDependencies).toEqual({ jest: '^29.0.0' });
    expect(result.engineVersion).toBe('1.2.3');
    expect(result.debugPort).toBe(9229);
    expect(result.processVersions).toEqual({ node: '20.0.0' });
    expect(result.port).toBe(3000);
  });

  it('should set moderation panel subtitle for moderator', async () => {
    mockSession.payload.role = UserRole.MODERATOR;
    boardPersistenceService.countAll.mockResolvedValue(1);
    commentPersistenceService.countAll.mockResolvedValue(1);
    fileSystem.dirSize.mockResolvedValue(1);
    fileSystem.readTextFileOutOfVolume.mockResolvedValue(JSON.stringify({ dependencies: {}, devDependencies: {} }));
    utils.getPostgresVersion.mockResolvedValue('v');
    utils.getImageMagickVersion.mockResolvedValue('v');
    utils.getFfMpegVersion.mockResolvedValue('v');
    utils.getPgDumpVersion.mockResolvedValue('v');
    utils.getZipVersion.mockResolvedValue('v');

    cache.getOrCacheSync.mockImplementation((_key, cb) => cb());
    cache.getOrCache.mockImplementation(async (_key, cb) => cb());

    jest.spyOn(process, 'cwd').mockReturnValue('/fake');
    process.env['npm_package_version'] = '1.0.0';
    Object.defineProperty(process, 'debugPort', { value: 9229 });
    Object.defineProperty(process, 'versions', { value: { node: '20.0.0' } });
    jest.spyOn(require('os'), 'totalmem').mockReturnValue(1);
    jest.spyOn(require('os'), 'freemem').mockReturnValue(1);
    jest.spyOn(require('os'), 'uptime').mockReturnValue(1);
    jest.spyOn(require('os'), 'cpus').mockReturnValue([{}]);
    jest.spyOn(require('os'), 'hostname').mockReturnValue('h');

    const result = await service.getDashboardPage(mockReq as Request, mockSession as ISession);
    expect(result.commons.pageSubtitle).toBeDefined();
  });

  describe('cache interactions', () => {
    it('should get process info from cache', () => {
      const cachedValue = { engineVersion: 'v1', debugPort: 1234, processVersions: { node: 'v20' } };
      cache.getOrCacheSync.mockReturnValue(cachedValue);

      const result = service['getProcessInfo']();
      expect(result).toBe(cachedValue);
      expect(cache.getOrCacheSync).toHaveBeenCalledWith('DASHBOARD_PROCESS_VERSIONS', expect.any(Function));
    });

    it('should compute process info when not in cache', () => {
      cache.getOrCacheSync.mockImplementation((_key, cb) => cb());
      process.env['npm_package_version'] = 'v2';
      Object.defineProperty(process, 'debugPort', { value: 4321 });
      Object.defineProperty(process, 'versions', { value: { node: 'v22' } });

      const result = service['getProcessInfo']();
      expect(result.engineVersion).toBe('v2');
      expect(result.debugPort).toBe(4321);
      expect(result.processVersions).toEqual({ node: 'v22' });
    });

    it('should get dependencies from cache', async () => {
      const cachedDeps = { dependencies: { a: '1' }, devDependencies: { b: '2' } };
      cache.getOrCache.mockResolvedValue(cachedDeps);

      const result = await service['getDependencies']();
      expect(result).toBe(cachedDeps);
      expect(cache.getOrCache).toHaveBeenCalledWith('DASHBOARD_DEPENDENCIES_VERSIONS', expect.any(Function));
    });

    it('should compute dependencies when not in cache', async () => {
      cache.getOrCache.mockImplementation(async (_key, cb) => cb());
      jest.spyOn(process, 'cwd').mockReturnValue('/fake');
      fileSystem.readTextFileOutOfVolume.mockResolvedValue(
        JSON.stringify({ dependencies: { x: '1' }, devDependencies: { y: '2' } })
      );

      const result = await service['getDependencies']();
      expect(result.dependencies).toEqual({ x: '1' });
      expect(result.devDependencies).toEqual({ y: '2' });
    });

    it('should get port from cache', () => {
      cache.getOrCacheSync.mockReturnValue(12345);
      const result = service['getPort'](mockReq as Request);
      expect(result).toBe(12345);
      expect(cache.getOrCacheSync).toHaveBeenCalledWith('DASHBOARD_PORT', expect.any(Function));
    });

    it('should compute port when not in cache', () => {
      cache.getOrCacheSync.mockImplementation((_key, cb) => cb());
      const result = service['getPort']({ headers: { host: 'localhost:8080' } } as Request);
      expect(result).toBe(8080);
    });
  });
});
