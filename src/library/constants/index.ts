import * as process from 'node:process';
import * as path from 'node:path';
import { CronExpression } from '@nestjs/schedule';

/**
 * Application constants
 */
export class Constants {
  /** Full paths */
  public static Paths = class {
    /** `templates` directory (*.pug) */
    public static TEMPLATES = path.join(process.cwd(), 'templates');

    /** `templates` directory (*.pug) */
    public static STATIC = path.join(process.cwd(), 'static');

    /** `.presets` directory */
    public static PRESETS = path.join(process.cwd(), '.presets');
  };

  /** Settings directory name */
  public static SETTINGS_DIR = '_settings';

  /** IB uploaded files directory name */
  public static SRC_DIR = 'src';

  /** IB uploaded thumbnails directory name */
  public static THUMB_DIR = 'thumb';

  /** Thread pages directory name */
  public static RES_DIR = 'res';

  /** Archived pages directory name */
  public static ARCH_DIR = 'arch';

  /** `spam` file name */
  public static SPAM_FILE_NAME = 'spam';

  /** `black_list` file name */
  public static BLACK_LIST_FILE_NAME = 'black_list';

  /** `global-settings` file name */
  public static FILE_GLOBAL_SETTINGS = 'global-settings';

  /** Default thumbnail side size */
  public static DEFAULT_THUMBNAIL_SIDE = 200;

  /** Potential reserved board URLs */
  public static RESERVED_BOARD_URLS = [
    'img',
    'css',
    'js',
    'icons',
    'kashiwa',
    'front',
    'frame',
    'faq',
    'rules',
    'api',
    'menu'
  ];

  /** Default string file size format */
  public static FILE_SIZE_FORMAT: 'si' | 'iec' | 'jedec' = 'jedec';

  /** Default string datetime format */
  public static DATE_DISPLAY_FORMAT = 'EEE dd MMM yyyy HH:mm:ss';

  /** Default HTML suffix */
  public static HTML_SUFFIX = '.html';

  /** Default page size */
  public static DEFAULT_PAGE_SIZE = 10;

  /** List of supported file types (MIME) */
  public static SUPPORTED_FILE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/aac',
    'audio/x-m4a',
    'audio/mpeg',
    'audio/ogg',
    'audio/flac',
    'application/x-bittorrent',
    'application/x-shockwave-flash',
    'application/x-7z-compressed'
  ];

  /** Preview replies count of board page */
  public static DEFAULT_LAST_REPLIES_COUNT = 7;

  /** Milliseconds of 10 years */
  public static COOKIES_10_YEARS = 315360000000;

  /** Milliseconds for removing cookies */
  public static COOKIES_ERASING_VALUE = -9999;

  /** Simple string datetime format */
  public static SIMPLE_DATE_FORMAT = 'dd MMM yyyy HH:mm';

  /** `dump-target'` file name */
  public static FILE_DUMP_TARGET = 'dump-target';

  /** Cron expression of ban rotation interval */
  public static BAN_ROTATION_INTERVAL = CronExpression.EVERY_HOUR;

  /** Cron expression of cached by the API posts rotation interval */
  public static POST_CLEARING_INTERVAL = CronExpression.EVERY_MINUTE;

  /** Maximum validated file size in bytes */
  public static MAX_VALIDATED_FILE_SIZE = 20e6 - 1;
}
