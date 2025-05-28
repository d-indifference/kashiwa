import { Transform } from 'class-transformer';
import { normalizeStringArray } from '@admin/transforms';
import { KIsArray, KIsIn, KIsString } from '@library/validators';

const DUMP_FORM_DB_TABLE_ARGUMENTS = ['_prisma_migrations', 'ban', 'board', 'comment', 'user'];
const DUMP_FORM_ADDITIONAL_ARGUMENTS = ['cache', 'settings'];

/**
 * Form object for creation of new dump
 */
export class DumpForm {
  /**
   * List of database tables for dumping
   */
  @Transform(normalizeStringArray)
  @KIsArray('DATABASE_TABLES')
  @KIsString('DATABASE_TABLES', { each: true })
  @KIsIn('DATABASE_TABLES', DUMP_FORM_DB_TABLE_ARGUMENTS, { each: true })
  dbTable: string[];

  /**
   * Dump of settings and site cache
   */
  @Transform(normalizeStringArray)
  @KIsArray('ADDITIONAL')
  @KIsString('ADDITIONAL', { each: true })
  @KIsIn('ADDITIONAL', DUMP_FORM_ADDITIONAL_ARGUMENTS, { each: true })
  additional: string[];

  /**
   * Displayed path of created archive with site dump (NOT A FORM FIELD!)
   */
  createdArchivePath?: string;
}
