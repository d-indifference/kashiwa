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
  public static RESERVED_BOARD_URLS = ['img', 'css', 'js', 'icons'];
}
