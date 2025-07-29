import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { promisify } from 'node:util';
import { exec, PromiseWithChild } from 'child_process';
import * as path from 'node:path';
import { LOCALE } from '@locale/locale';
import * as process from 'node:process';
import { FileSystemProvider } from '@library/providers';

/**
 * Utility provider for database table dumping
 */
@Injectable()
export class DatabaseDumpingUtilsProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(DatabaseDumpingUtilsProvider.name);
  }

  /**
   * Dump database table and return temporary placement of dump files
   * @param dbTable List of table dumping keyword
   */
  public async dumpSql(dbTable: string[]): Promise<string[]> {
    const tables = this.getTableNamesFromKeywords(dbTable);
    return await Promise.all(tables.map(table => this.dumpTable(table)));
  }

  private getTableNamesFromKeywords(dbTable: string[]): string[] {
    const tables: string[] = [];
    this.getTableNamesByKeyword(dbTable, tables, '_prisma_migrations', '_prisma_migrations');
    this.getTableNamesByKeyword(dbTable, tables, 'ban', 'ban');
    this.getTableNamesByKeyword(dbTable, tables, 'board', 'board', 'board_settings');
    this.getTableNamesByKeyword(dbTable, tables, 'comment', 'comment', 'attached_file');
    this.getTableNamesByKeyword(dbTable, tables, 'user', 'user');

    return tables;
  }

  /**
   * Mapping a list of keywords to their corresponding list of tables
   * @param dbTable List of table dumping keyword
   * @param result List of tables for dumping
   * @param keyword Keyword matching tables
   * @param tables List of tables matching current keyword
   */
  private getTableNamesByKeyword(dbTable: string[], result: string[], keyword: string, ...tables: string[]): void {
    if (dbTable.includes(keyword)) {
      result.push(...tables);
    }
  }

  /**
   * Dump table and return its temporary placement
   */
  private async dumpTable(table: string): Promise<string> {
    this.logger.info({ table }, 'dumping of table');

    const connectionString = this.getDatabaseConnectionString();
    const dumpFilePath = this.toDumpFilePath();
    const dumpFileName = this.getDumpFileName(table);

    await this.fileSystem.ensureDirOutOfVolume(dumpFilePath);

    const fullSqlPath = path.join(dumpFilePath, dumpFileName);
    await this.runPgDump(connectionString, fullSqlPath, ['--data-only', '--inserts', `--table=kashiwa.${table}`]);

    return fullSqlPath;
  }

  /**
   * Returns database connection. If it is not specified, throws Exception
   */
  private getDatabaseConnectionString(): string {
    const url = process.env.DATABASE_URL;
    if (url) {
      return url.split('?')[0];
    }
    throw new InternalServerErrorException(LOCALE['DB_CONNECTION_IS_NOT_SPEC']);
  }

  /**
   * Returns dump file temporary directory
   */
  private toDumpFilePath(): string {
    return path.join('/tmp', 'kashiwa-db');
  }

  /**
   * Returns dump SQL file name
   */
  private getDumpFileName(table: string): string {
    const currentTime = Date.now();
    return `kashiwa-${table}-${currentTime}.sql`;
  }

  /**
   * Execute `pg_dump` for saving SQL files
   * @param connectionUrl Database connection URL
   * @param outputPath Fully output SQL path
   * @param options `pg_dump` options
   */
  private async runPgDump(connectionUrl: string, outputPath: string, options: string[] = []): Promise<void> {
    const pgDumpCmd = ['pg_dump', ...options, `"${connectionUrl}"`, `> "${outputPath}"`].join(' ');

    try {
      await this.execAsync()(pgDumpCmd);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * A wrapper for `exec` from `node:child_process`
   */
  private execAsync(): (command: string) => PromiseWithChild<{ stdout: string; stderr: string }> {
    return promisify(exec);
  }
}
