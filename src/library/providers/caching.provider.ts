import { Injectable } from '@nestjs/common';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import * as fsExtra from 'fs-extra';

@Injectable()
export class CachingProvider {
  constructor() {}

  public async createCache(url: string): Promise<void> {
    await this.mkdir(url);
    await Promise.all([
      await this.mkdir(url, Constants.SRC_DIR),
      await this.mkdir(url, Constants.RES_DIR),
      await this.mkdir(url, Constants.THUMB_DIR)
    ]);
    this.reloadCache(url);
  }

  public async clearCache(url: string): Promise<void> {
    await Promise.all([
      await this.emptydir(url, Constants.RES_DIR),
      await this.emptydir(url, Constants.SRC_DIR),
      await this.emptydir(url, Constants.THUMB_DIR)
    ]);

    await this.removeFilesFromDir(url);
  }

  public async renameCache(oldName: string, newName: string): Promise<void> {
    await this.renameDir(oldName, newName);
  }

  public async removeCache(url: string): Promise<void> {
    await this.rmdir(url);
  }

  public reloadCache(url: string): void {}

  private async mkdir(...dirs: string[]): Promise<void> {
    const pathToDir = path.join(Constants.Paths.APP_VOLUME, ...dirs);
    await fsExtra.ensureDir(pathToDir);
  }

  private async rmdir(dir: string): Promise<void> {
    const pathToDir = path.join(Constants.Paths.APP_VOLUME, dir);
    await fsExtra.remove(pathToDir);
  }

  private async removeFilesFromDir(...dirs: string[]): Promise<void> {
    const dir = path.join(Constants.Paths.APP_VOLUME, ...dirs);
    const entries = await fsExtra.readdir(dir);
    await Promise.all(
      entries.map(async entry => {
        const fullPath = path.join(dir, entry);
        await fsExtra.remove(fullPath);
      })
    );
  }

  private async emptydir(...dirs: string[]): Promise<void> {
    const pathToDir = path.join(Constants.Paths.APP_VOLUME, ...dirs);
    await fsExtra.emptydir(pathToDir);
  }

  private async renameDir(oldName: string, newName: string): Promise<void> {
    const oldPath = path.join(Constants.Paths.APP_VOLUME, oldName);
    const newPath = path.join(Constants.Paths.APP_VOLUME, newName);

    await fsExtra.rename(oldPath, newPath);
  }
}
