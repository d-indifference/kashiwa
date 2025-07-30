import { normalizeStringArray } from '@library/transforms';
import { Transform } from 'class-transformer';
import { KIsArray, KIsIn, KIsString } from '@library/validators';
import { Form, FormCheckboxList, FormMethods } from '@admin/lib';
import { LOCALE } from '@locale/locale';

const DUMP_FORM_DB_TABLE_ARGUMENTS = ['_prisma_migrations', 'ban', 'board', 'comment', 'user'];
const DUMP_FORM_ADDITIONAL_ARGUMENTS = ['cache', 'settings'];

/**
 * Form object for creation of new dump
 */
@Form({ method: FormMethods.POST, action: '/kashiwa/dump' })
export class DumpForm {
  /**
   * List of database tables for dumping
   */
  @FormCheckboxList({
    displayName: LOCALE.DATABASE_TABLES as string,
    values: [
      { value: '_prisma_migrations', name: 'dbTable', displayName: '_prisma_migrations' },
      { value: 'ban', name: 'dbTable', displayName: 'ban' },
      { value: 'board', name: 'dbTable', displayName: 'board & board_settings' },
      { value: 'comment', name: 'dbTable', displayName: 'comment & attached_file' },
      { value: 'user', name: 'dbTable', displayName: 'user' }
    ]
  })
  @Transform(normalizeStringArray)
  @KIsArray('DATABASE_TABLES')
  @KIsString('DATABASE_TABLES', { each: true })
  @KIsIn('DATABASE_TABLES', DUMP_FORM_DB_TABLE_ARGUMENTS, { each: true })
  dbTable: string[];

  /**
   * Dump of settings and site cache
   */
  @FormCheckboxList({
    displayName: LOCALE.ADDITIONAL as string,
    values: [
      { value: 'cache', name: 'additional', displayName: LOCALE.BOARDS_CACHE as string },
      { value: 'settings', name: 'additional', displayName: LOCALE.SITE_SETTINGS as string }
    ]
  })
  @Transform(normalizeStringArray)
  @KIsArray('ADDITIONAL')
  @KIsString('ADDITIONAL', { each: true })
  @KIsIn('ADDITIONAL', DUMP_FORM_ADDITIONAL_ARGUMENTS, { each: true })
  additional: string[];
}
