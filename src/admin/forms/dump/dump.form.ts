import { Transform } from 'class-transformer';
import { normalizeStringArray } from '@admin/transforms';
import { IsArray, IsIn, IsString } from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';

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
  @IsArray({ message: V_LOCALE['V_ARRAY'](vStr(LOCALE['DATABASE_TABLES'])) })
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['DATABASE_TABLES'])), each: true })
  @IsIn(DUMP_FORM_DB_TABLE_ARGUMENTS, {
    message: V_LOCALE['V_IN'](vStr(LOCALE['DATABASE_TABLES']), DUMP_FORM_DB_TABLE_ARGUMENTS),
    each: true
  })
  dbTable: string[];

  /**
   * Dump of settings and site cache
   */
  @Transform(normalizeStringArray)
  @IsArray({ message: V_LOCALE['V_ARRAY'](vStr(LOCALE['ADDITIONAL'])) })
  @IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE['ADDITIONAL'])), each: true })
  @IsIn(DUMP_FORM_ADDITIONAL_ARGUMENTS, {
    message: V_LOCALE['V_IN'](vStr(LOCALE['ADDITIONAL']), DUMP_FORM_ADDITIONAL_ARGUMENTS),
    each: true
  })
  additional: string[];

  /**
   * Displayed path of created archive with site dump (NOT A FORM FIELD!)
   */
  createdArchivePath?: string;
}
