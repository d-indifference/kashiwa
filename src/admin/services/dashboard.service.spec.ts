/* eslint-disable @typescript-eslint/no-require-imports */
import { DashboardService } from './dashboard.service';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { DashboardUtilsProvider } from '@admin/providers';
import { FileSystemProvider } from '@library/providers';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ISession } from '@admin/interfaces';

describe('DashboardService', () => {
  let service: DashboardService;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let utils: jest.Mocked<DashboardUtilsProvider>;
  let fileSystem: jest.Mocked<FileSystemProvider>;
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
    service = new DashboardService(boardPersistenceService, commentPersistenceService, utils, fileSystem);
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

    expect(result.commons.pageTitle).toBeDefined();
    expect(result.totalBoards).toBe(2);
    expect(result.totalComments).toBe(10);
    expect(result.diskSpaceUsed).toBe(12345);
    expect(result.dependencies).toEqual({ express: '^4.0.0' });
    expect(result.devDependencies).toEqual({ jest: '^29.0.0' });
    expect(result.postgresVersion).toBe('PostgreSQL 15.0');
    expect(result.imageMagickVersion).toBe('7.1.0-19');
    expect(result.ffMpegVersion).toBe('7.1.0-19');
    expect(result.pgDumpVersion).toBe('pg_dump (PostgreSQL) 15.0');
    expect(result.zipVersion).toBe('3.0');
    expect(result.engineVersion).toBe('1.2.3');
    expect(result.debugPort).toBe(9229);
    expect(result.processVersions).toEqual({ node: '20.0.0' });
    expect(result.uptime).toBe(123);
    expect(result.cpus).toEqual([{ model: 'FakeCPU' }]);
    expect(result.memory).toEqual({ total: 1000, free: 400, inUsage: 600 });
    expect(result.host).toBe('test_host');
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
});
