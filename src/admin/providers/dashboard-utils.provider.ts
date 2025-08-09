import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'node:util';
import { exec, PromiseWithChild } from 'child_process';
import { PrismaService } from '@persistence/lib';
import { Prisma } from '@prisma/client';
import { LOCALE } from '@locale/locale';

/**
 * Utility provider for getting versions of external tools (database, imagemagick, etc.)
 */
@Injectable()
export class DashboardUtilsProvider {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a version of PostgreSQL
   */
  public async getPostgresVersion(): Promise<string> {
    const versionQuery: Record<string, string>[] = await this.prisma.$queryRaw(Prisma.sql`SELECT VERSION();`);
    return versionQuery[0]['version'];
  }

  /**
   * Returns a version of ImageMagick
   */
  public async getImageMagickVersion(): Promise<string> {
    return await this.getToolVersion('convert --version', 'FAILED_IMAGEMAGICK_VERSION', stdout => {
      const versionLine = stdout.split('\n')[0];
      const versionNumber = versionLine.split(': ')[1]?.replace('https://imagemagick.org', '').trim();
      return versionNumber || 'unknown';
    });
  }

  /**
   * Returns a version of FfMpeg
   */
  public async getFfMpegVersion(): Promise<string> {
    return await this.getToolVersion('ffmpeg -version', 'FAILED_FFMPEG_VERSION', stdout => {
      const versionMatch = stdout.match(/ffmpeg version (\S+)/);
      return versionMatch !== null ? versionMatch[1] : 'unknown';
    });
  }

  /**
   * Returns a version of `pg_dump`
   */
  public async getPgDumpVersion(): Promise<string> {
    return await this.getToolVersion('pg_dump --version', 'FAILED_PG_DUMP_VERSION', stdout => stdout.trim());
  }

  /**
   * Returns a version of `zip`
   */
  public async getZipVersion(): Promise<string> {
    return await this.getToolVersion('zip --version', 'FAILED_ZIP_VERSION', stdout => {
      const match = stdout.match(/This is Zip\s+([\d.]+)/i);
      return match ? match[1].trim() : 'unknown version';
    });
  }

  /**
   * Template for getting of CLI tool version
   * @param command Command of getting version
   * @param errorLocale Locale key for failed command execution
   * @param stdoutFormatCb Callback for formatting of command output
   */
  private async getToolVersion(
    command: string,
    errorLocale: string,
    stdoutFormatCb: (stdout: string) => string
  ): Promise<string> {
    try {
      const { stdout } = await this.execAsync()(command);
      return stdoutFormatCb(stdout);
    } catch (e) {
      const message = `${LOCALE[errorLocale] as string}: ${e.stderr || e.message}`;
      Logger.error(message, 'DashboardUtilsProvider');
      return message;
    }
  }

  /**
   * A wrapper for `exec` from `node:child_process`
   */
  private execAsync(): (command: string) => PromiseWithChild<{ stdout: string; stderr: string }> {
    return promisify(exec);
  }
}
