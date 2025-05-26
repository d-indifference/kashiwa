import { FormPage } from '@admin/pages';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISession } from '@admin/interfaces';
import { DumpForm } from '@admin/forms/dump';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import * as process from 'node:process';
import * as fsExtra from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { LOCALE } from '@locale/locale';
import * as fs from 'node:fs';
import * as archiver from 'archiver';
import { PinoLogger } from 'nestjs-pino';

const execAsync = promisify(exec);

/**
 * Service for creating of site contend and database dump archives
 */
@Injectable()
export class DumpService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(DumpService.name);
  }

  /**
   * Get preset to the form
   * @param session Session object
   */
  public getForm(session: ISession): FormPage<DumpForm> {
    const form: DumpForm = { additional: [], dbTable: [] };

    return new FormPage(session, 'CREATE', form);
  }

  /**
   * Execute dumping process and save result to application volume as zip-archive
   * @param session Session object
   * @param form Dump options
   */
  public async processDump(session: ISession, form: DumpForm): Promise<FormPage<DumpForm>> {
    this.logger.info(form, 'processDump');

    const targetPath = Constants.Paths.APP_VOLUME;
    const sqlDumps = await this.makeSqlDumps(form);
    const dirDumps = await this.getCacheForArchivation(form);

    const archivePath = path.join(targetPath, `kashiwa-v${process.env.npm_package_version}-dump-${Date.now()}.zip`);

    await this.zipFiles(sqlDumps, dirDumps, archivePath);

    await fsExtra.remove('/tmp/kashiwa-db');

    await this.getCacheForArchivation(form);

    return new FormPage<DumpForm>(session, 'CREATE', {
      createdArchivePath: archivePath,
      dbTable: [],
      additional: []
    });
  }

  /**
   * Get list of directories to archive them
   * @param form Dump options
   */
  private async getCacheForArchivation(form: DumpForm): Promise<string[]> {
    const entries = await fsExtra.readdir(Constants.Paths.APP_VOLUME, { withFileTypes: true });
    const dirs = new Map();

    entries
      .filter(entry => entry.isDirectory())
      .forEach(entry => {
        dirs.set(entry.name, entry.name);
      });

    if (!form.additional.includes('settings')) {
      dirs.delete(Constants.SETTINGS_DIR);
    }

    if (!form.additional.includes('cache')) {
      dirs.clear();

      if (form.additional.includes('settings')) {
        dirs.set(Constants.SETTINGS_DIR, Constants.SETTINGS_DIR);
      }
    }

    const fullPathDirectories: string[] = [];

    dirs.forEach((value: string) => {
      fullPathDirectories.push(path.join(Constants.Paths.APP_VOLUME, value));
    });

    this.logger.info(fullPathDirectories, 'directories for caching');

    return fullPathDirectories;
  }

  /**
   * Return list of all dumped SQL files of tables
   * @param form Dump options
   */
  private async makeSqlDumps(form: DumpForm): Promise<string[]> {
    const sqlDumps: string[] = [];

    await this.dumpByKeyword(form, '_prisma_migrations', this.dumpTables, ['_prisma_migrations'], sqlDumps);
    await this.dumpByKeyword(form, 'ban', this.dumpTables, ['ban'], sqlDumps);
    await this.dumpByKeyword(form, 'board', this.dumpTables, ['board', 'board_settings'], sqlDumps);
    await this.dumpByKeyword(form, 'comment', this.dumpTables, ['comment', 'attached_file'], sqlDumps);
    await this.dumpByKeyword(form, 'ban', this.dumpTables, ['user'], sqlDumps);

    return sqlDumps;
  }

  /**
   * Create an SQL dump if the option exists in the params form
   * @param form Dump options
   * @param keyword Param for table dumping
   * @param callback Dump method
   * @param callbackArgs Arguments of the dump method
   * @param sqlDumps SQL dump files list
   */
  private async dumpByKeyword(
    form: DumpForm,
    keyword: string,
    callback: (tables: string[]) => Promise<string[]>,
    callbackArgs: string[],
    sqlDumps: string[]
  ): Promise<void> {
    if (form.dbTable.includes(keyword)) {
      const dumps = (await callback.call(this, callbackArgs)) as string[];
      sqlDumps.push(...dumps);
    }
  }

  /**
   * Dump tables to SQL and return list of dump files
   * @param tables List of SQL tables
   */
  private async dumpTables(tables: string[]): Promise<string[]> {
    const dumpFiles: string[] = [];

    for (const table of tables) {
      const file = await this.dumpTable(table);
      dumpFiles.push(file);
    }

    return dumpFiles;
  }

  /**
   * Dump table to SQL and return dump file path
   * @param table SQL table in database
   */
  private async dumpTable(table: string): Promise<string> {
    if (process.env.DATABASE_URL) {
      this.logger.info({ table }, 'dumping of table');

      const currentTime = Date.now();
      const connectionString = process.env.DATABASE_URL.split('?')[0];
      const dumpPath = path.join('/tmp', 'kashiwa-db');
      const sqlFile = `kashiwa-${table}-${currentTime}.sql`;
      await fsExtra.ensureDir(dumpPath);
      const fullSqlPath = path.join(dumpPath, sqlFile);

      await this.runPgDump(connectionString, fullSqlPath, ['--data-only', '--inserts', `--table=kashiwa.${table}`]);

      return fullSqlPath;
    }
    throw new InternalServerErrorException(LOCALE['DB_CONNECTION_IS_NOT_SPEC']);
  }

  /**
   * Wrapping of `pg_dump`
   * @param connectionUrl Prisma Connection url
   * @param outputPath Path of target SQL file
   * @param options `pg_dump` options
   */
  private async runPgDump(connectionUrl: string, outputPath: string, options: string[] = []): Promise<void> {
    const pgDumpCmd = ['pg_dump', ...options, `"${connectionUrl}"`, `> "${outputPath}"`].join(' ');

    try {
      await execAsync(pgDumpCmd);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Archive files and directories to zip-archive
   * @param files Files for archiving
   * @param directories Directories for archiving
   * @param outputZipPath Output zip archive path
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

      for (const filePath of files) {
        const fileName = path.basename(filePath);
        archive.file(filePath, { name: fileName });
      }

      for (const dir of directories) {
        const parts = dir.split(path.sep);
        const lastParts = parts.slice(-2);
        archive.directory(`${dir}/`, lastParts.join('/'));
      }

      archive.finalize().then();
    });
  }
}
