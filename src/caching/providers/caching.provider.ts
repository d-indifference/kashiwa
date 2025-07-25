import { Injectable } from '@nestjs/common';
import { Constants } from '@library/constants';
import { CachingUpdateProvider } from '@caching/providers/caching.update.provider';
import { FileSystemProvider } from '@library/providers';

/**
 * Providers for page cache operations
 */
@Injectable()
export class CachingProvider {
  constructor(
    private readonly cachingUpdateProvider: CachingUpdateProvider,
    private readonly fileSystem: FileSystemProvider
  ) {}

  /**
   * Create cache base for board
   * @param url Board URL
   */
  public async createCache(url: string): Promise<void> {
    await this.mkdir(url);
    await Promise.all([
      await this.mkdir(url, Constants.SRC_DIR),
      await this.mkdir(url, Constants.RES_DIR),
      await this.mkdir(url, Constants.THUMB_DIR)
    ]);
    await this.fullyReloadCache(url);
  }

  /**
   * Clear all files form board cache
   * @param url Board URL
   */
  public async clearCache(url: string): Promise<void> {
    await Promise.all([
      await this.emptyDir(url, Constants.RES_DIR),
      await this.emptyDir(url, Constants.SRC_DIR),
      await this.emptyDir(url, Constants.THUMB_DIR)
    ]);

    await this.removeFilesFromDir(url);
  }

  /**
   * Rename board cache folder
   * @param oldName Old folder name
   * @param newName New folder name
   */
  public async renameCache(oldName: string, newName: string): Promise<void> {
    await this.renameDir(oldName, newName);
  }

  /**
   * Remove board cache folder
   * @param url Board URL
   */
  public async removeCache(url: string): Promise<void> {
    await this.rmdir(url);
  }

  /**
   * Rebuild cached pages for board
   * @param url Board URL
   */
  public async fullyReloadCache(url: string): Promise<void> {
    await Promise.all([await this.removeFilesFromDir(url), await this.emptyDir(url, Constants.RES_DIR)]);
    await this.cachingUpdateProvider.fullyReloadCache(url);
  }

  /**
   * Rebuild cached page for thread and board pages with thread previews
   * @param url Board URL
   * @param num Thread number
   */
  public async reloadCacheForThread(url: string, num: bigint): Promise<void> {
    await this.cachingUpdateProvider.reloadCacheForThread(url, num);
  }

  private async mkdir(...dirs: string[]): Promise<void> {
    await this.fileSystem.ensureDir(dirs);
  }

  private async rmdir(dir: string): Promise<void> {
    await this.fileSystem.removePath([dir]);
  }

  private async removeFilesFromDir(...dirs: string[]): Promise<void> {
    const entries = (await this.fileSystem.readDir(dirs)).filter(e => e.isFile());
    await Promise.all(
      entries.map(async entry => {
        await this.fileSystem.removePath([...dirs, entry.name]);
      })
    );
  }

  private async emptyDir(...dirs: string[]): Promise<void> {
    await this.fileSystem.emptyDir(dirs);
  }

  private async renameDir(oldName: string, newName: string): Promise<void> {
    await this.fileSystem.renameDir([oldName], [newName]);
  }
}
