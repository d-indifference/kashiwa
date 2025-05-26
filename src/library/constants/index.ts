import * as process from 'node:process';
import * as path from 'node:path';

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

    /** application volume */
    public static APP_VOLUME = path.join(process.cwd(), 'volumes', 'application.kashiwa');

    /** full path to settings directory */
    public static SETTINGS = path.join(process.cwd(), 'volumes', 'application.kashiwa', '_settings');

    /** full path to .presets directory */
    public static PRESETS = path.join(process.cwd(), '.presets');

    /** full path to `spam` file */
    public static FILE_SPAM = path.join(process.cwd(), 'volumes', 'application.kashiwa', '_settings', 'spam');

    /** full path to `black_list` file */
    public static FILE_BLACK_LIST = path.join(
      process.cwd(),
      'volumes',
      'application.kashiwa',
      '_settings',
      'black_list'
    );
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

  /** Default thumbnail side size */
  public static DEFAULT_THUMBNAIL_SIDE = 200;

  /** Potential reserved board URLs */
  public static RESERVED_BOARD_URLS = ['img', 'css', 'js', 'icons', 'kashiwa', 'front', 'frame', 'faq', 'rules'];

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
    'application/x-bittorrent'
  ];

  /** Preview replies count of board page */
  public static DEFAULT_LAST_REPLIES_COUNT = 7;

  /** Milliseconds of 10 years */
  public static COOKIES_10_YEARS = 315360000000;

  /** Milliseconds for removing cookies */
  public static COOKIES_ERASING_VALUE = -9999;

  /** Simple string datetime format */
  public static SIMPLE_DATE_FORMAT = 'dd MMM yyyy HH:mm';

  /** `global-settings` file name */
  public static FILE_GLOBAL_SETTINGS = 'global-settings';

  /** `dump-target'` file name */
  public static FILE_DUMP_TARGET = 'dump-target';
}
