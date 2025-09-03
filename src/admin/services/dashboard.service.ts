import { Injectable } from '@nestjs/common';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import * as process from 'node:process';
import * as os from 'node:os';
import * as path from 'node:path';
import { LOCALE } from '@locale/locale';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { DashboardUtilsProvider } from '@admin/providers';
import { DashboardPage } from '@admin/pages';
import { ISession } from '@admin/interfaces';
import { FileSystemProvider, InMemoryCacheProvider } from '@library/providers';

/**
 * Service for rendering the dashboard page
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService,
    private readonly utils: DashboardUtilsProvider,
    private readonly fileSystem: FileSystemProvider,
    private readonly cache: InMemoryCacheProvider
  ) {}

  /**
   * Render dashboard page
   * @param req Express.js `req` object
   * @param session Session data
   */
  public async getDashboardPage(req: Request, session: ISession): Promise<DashboardPage> {
    const statsFromDb = await this.getStatsFromDb();
    const diskSpaceUsed = await this.getDiskSpaceUsed();
    const processInfo = this.getProcessInfo();
    const osInfo = this.getOsInfo();
    const port = this.getPort(req);
    const dependencies = await this.getDependencies();
    const postgresVersion = await this.utils.getPostgresVersion();
    const imageMagickVersion = await this.utils.getImageMagickVersion();
    const ffMpegVersion = await this.utils.getFfMpegVersion();
    const pgDumpVersion = await this.utils.getPgDumpVersion();
    const zipVersion = await this.utils.getZipVersion();

    return {
      commons: {
        pageTitle: LOCALE['MANAGEMENT'] as string,
        pageSubtitle:
          session.payload.role === UserRole.MODERATOR
            ? (LOCALE['MODERATION_PANEL'] as string)
            : (LOCALE['DASHBOARD'] as string)
      },
      session,
      ...statsFromDb,
      ...processInfo,
      ...osInfo,
      ...dependencies,
      port,
      postgresVersion,
      imageMagickVersion,
      ffMpegVersion,
      pgDumpVersion,
      zipVersion,
      diskSpaceUsed
    };
  }

  /**
   * Get info about count of boards and comments
   */
  private async getStatsFromDb(): Promise<Pick<DashboardPage, 'totalComments' | 'totalBoards'>> {
    const [totalBoards, totalComments] = await Promise.all([
      this.boardPersistenceService.countAll(),
      this.commentPersistenceService.countAll()
    ]);
    return { totalBoards, totalComments };
  }

  /**
   * Get info about size of application volume
   */
  private async getDiskSpaceUsed(): Promise<number> {
    return await this.fileSystem.dirSize([]);
  }

  /**
   * Get info from `node:process`
   */
  private getProcessInfo(): Pick<DashboardPage, 'engineVersion' | 'debugPort' | 'processVersions'> {
    return this.cache.getOrCacheSync('DASHBOARD_PROCESS_VERSIONS', () => {
      return {
        engineVersion: process.env.npm_package_version as string,
        debugPort: process.debugPort,
        processVersions: process.versions
      };
    });
  }

  /**
   * Get info from `node:os`
   */
  private getOsInfo(): Pick<DashboardPage, 'uptime' | 'cpus' | 'memory' | 'host'> {
    const total = os.totalmem();
    const free = os.freemem();

    return {
      uptime: os.uptime(),
      cpus: os.cpus(),
      memory: { total, free, inUsage: total - free },
      host: os.hostname()
    };
  }

  /**
   * Get info from `package.json`
   */
  private async getDependencies(): Promise<Pick<DashboardPage, 'dependencies' | 'devDependencies'>> {
    return await this.cache.getOrCache('DASHBOARD_DEPENDENCIES_VERSIONS', async () => {
      const pathToPackageJson = path.join(process.cwd(), 'package.json');

      const buffer = await this.fileSystem.readTextFileOutOfVolume(pathToPackageJson);
      const content: Record<string, unknown> = JSON.parse(buffer);

      return {
        dependencies: content['dependencies'] as Record<string, string>,
        devDependencies: content['devDependencies'] as Record<string, string>
      };
    });
  }

  /**
   * Get application port
   */
  private getPort(req: Request): number | undefined {
    return this.cache.getOrCacheSync('DASHBOARD_PORT', () => {
      const port = req.headers.host?.split(':')[1];
      return port && !isNaN(Number(port)) ? parseInt(port) : undefined;
    });
  }
}
