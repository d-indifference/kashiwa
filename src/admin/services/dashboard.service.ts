import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { DashboardPage } from '@admin/pages/dashboard';
import { ISession } from '@admin/interfaces';
import { FilesystemOperator } from '@library/filesystem';
import { Prisma } from '@prisma/client';
import * as path from 'node:path';
import * as process from 'node:process';
import * as fs from 'fs/promises';
import * as os from 'node:os';
import { Request } from 'express';
import { exec } from 'child_process';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { LOCALE } from '@locale/locale';

/**
 * Service for site dashboard page
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardPersistenceService: BoardPersistenceService,
    private readonly commentPersistenceService: CommentPersistenceService
  ) {}

  /**
   * Render dashboard page
   * @param req Express.js `req` object
   * @param session Session data
   */
  public async getDashboardPage(req: Request, session: ISession): Promise<DashboardPage> {
    const totalBoards = await this.boardPersistenceService.countAll();
    const totalComments = await this.commentPersistenceService.countAll();
    const diskSpaceUsed = await FilesystemOperator.dirSize();
    const postgresVersion = await this.getPostgresVersion();
    const { dependencies, devDependencies } = await this.getDependencies();
    const port = this.getPort(req);
    const imageMagickVersion = await this.getImageMagickVersion();

    return new DashboardPage(
      session,
      totalBoards,
      totalComments,
      diskSpaceUsed,
      os.uptime(),
      os.cpus(),
      {
        total: os.totalmem(),
        free: os.freemem()
      },
      port,
      process.debugPort,
      os.hostname(),
      process.versions,
      postgresVersion,
      imageMagickVersion,
      dependencies,
      devDependencies
    );
  }

  /**
   * Get current application port
   */
  private getPort(req: Request): number | undefined {
    if (req.headers.host) {
      return parseInt(req.headers.host.split(':')[1]);
    }

    return undefined;
  }

  /**
   * Select Postgres version
   */
  private async getPostgresVersion(): Promise<string> {
    const postgresVersionQuery = (await this.prisma.$queryRaw(Prisma.sql`SELECT VERSION();`)) as Record<
      string,
      string
    >[];

    return postgresVersionQuery[0]['version'];
  }

  /**
   * Get dependencies list from `package.json`
   */
  private async getDependencies(): Promise<Pick<DashboardPage, 'dependencies' | 'devDependencies'>> {
    const pathToPackageJson = path.join(process.cwd(), 'package.json');

    const buffer = await fs.readFile(pathToPackageJson, { encoding: 'utf-8' });
    const content: Record<string, unknown> = JSON.parse(buffer);

    return {
      dependencies: content['dependencies'] as Record<string, string>,
      devDependencies: content['devDependencies'] as Record<string, string>
    };
  }

  /**
   * Get and parse Imagemagick version
   */
  private getImageMagickVersion(): Promise<string> {
    return new Promise(resolve => {
      exec('convert --version', (error, stdout, stderr) => {
        if (error) {
          const message = `${LOCALE['FAILED_IMAGEMAGICK_VERSION'] as string}: ${stderr || error.message}`;
          Logger.error(message, 'DashboardService');
          throw new InternalServerErrorException(message);
        }
        const versionLine = stdout.split('\n')[0];
        const versionNumber = versionLine.split(': ')[1].replace('https://imagemagick.org', '');
        resolve(versionNumber);
      });
    });
  }
}
