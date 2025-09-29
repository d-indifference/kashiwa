import { PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { FormPage, RenderableSessionFormPage } from '@admin/lib';
import { DumpForm } from '@admin/forms';
import { LOCALE } from '@locale/locale';
import { Response } from 'express';
import { Constants } from '@library/constants';
import { DatabaseDumpingUtilsProvider } from '@admin/providers';
import { Dirent } from 'fs-extra';
import * as path from 'path';
import * as fs from 'node:fs';
import * as archiver from 'archiver';
import { FileSystemProvider } from '@library/providers';
import { ConfigService } from '@nestjs/config';

/**
 * Service for creating of site contend and database dump archives
 */
@Injectable()
export class DumpService {
  constructor(
    private readonly databaseDumpingUtils: DatabaseDumpingUtilsProvider,
    private readonly fileSystem: FileSystemProvider,
    private readonly logger: PinoLogger,
    private readonly config: ConfigService
  ) {
    this.logger.setContext(DumpService.name);
  }

  /**
   * Get preset to the form
   * @param session Session object
   */
  public getForm(session: ISession): RenderableSessionFormPage {
    this.logger.debug({ session }, 'getForm');

    const form = new DumpForm();
    form.dbTable = ['_prisma_migrations', 'ban', 'board', 'comment', 'user'];
    form.additional = ['cache', 'settings'];

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.SITE_DUMP as string,
      pageSubtitle: LOCALE.SITE_DUMP as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Execute dumping process and save result to application volume as zip-archive
   * @param form Dump options
   * @param res `express.js` `Response` object
   */
  public async processDump(form: DumpForm, res: Response): Promise<void> {
    this.logger.info({ form }, 'processDump');

    const dumpTargetPath = this.config.getOrThrow<string>('file-storage.path');

    const sqlDumps = await this.databaseDumpingUtils.dumpSql(form.dbTable);
    const dirDumps = await this.getCacheForArchivation(form);
    const archivePath = this.makeFullDumpArchivePath(dumpTargetPath);

    await this.zipFiles(sqlDumps, dirDumps, archivePath);
    await this.afterArchiving();

    res.redirect('/kashiwa/dump');
  }

  /**
   * Get full path of archive with dumped data
   */
  private makeFullDumpArchivePath(targetPath: string): string {
    const archiveName = `kashiwa-v${process.env.npm_package_version}-dump-${Date.now()}.zip`;
    return path.join(targetPath, archiveName);
  }

  /**
   * Get full path of cached files for archivation
   */
  private async getCacheForArchivation(form: DumpForm): Promise<string[]> {
    const volume = this.config.getOrThrow<string>('file-storage.path');
    const entries = await this.fileSystem.readDir(undefined);
    return entries.filter(entry => this.cacheFilterPredicate(form, entry)).map(entry => path.join(volume, entry.name));
  }

  /**
   * Predicate for filter files which are need to be dumped
   */
  private cacheFilterPredicate(form: DumpForm, entry: Dirent): boolean {
    if (!entry.isDirectory()) {
      return false;
    }

    const isSettings = entry.name === Constants.SETTINGS_DIR;
    const isCache = !isSettings;

    if (!form.additional.includes('settings') && isSettings) {
      return false;
    }

    return !(!form.additional.includes('cache') && isCache);
  }

  /**
   * Pack SQL files and cache to ZIP-archive
   */
  private zipFiles(files: string[], directories: string[], outputZipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve();
      });

      output.on('error', err => {
        reject(err);
      });

      archive.on('error', err => {
        reject(err);
      });

      archive.pipe(output);

      files.forEach(file => {
        const fileName = path.basename(file);
        archive.file(file, { name: fileName });
      });

      directories.forEach(dir => {
        const parts = dir.split(path.sep);
        const lastParts = parts.slice(-2);
        archive.directory(`${dir}/`, lastParts.join('/'));
      });

      archive.finalize().then();
    });
  }

  /**
   * Clear temporary cached directories and files
   */
  private async afterArchiving(): Promise<void> {
    await this.fileSystem.removePathOutOfVolume('/tmp/kashiwa-db');
  }
}
