import { Injectable, NotFoundException } from '@nestjs/common';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { Constants } from '@library/constants';
import { Dirent } from 'fs-extra';
import getFolderSize from 'get-folder-size';
import { createReadStream } from 'fs';
import * as mime from 'mime-types';
import { LOCALE } from '@locale/locale';

const DEFAULT_FILE_ENCODING = 'utf-8';

/**
 * Provider for file system operation
 */
@Injectable()
export class FileSystemProvider {
  /**
   * Ensures that a directory exists at the given absolute path outside the application volume.
   * Creates the directory if it doesn't exist.
   * @param fullPath - Absolute path to the target directory.
   */
  public async ensureDirOutOfVolume(fullPath: string): Promise<void> {
    await fsExtra.ensureDir(fullPath);
  }

  /**
   * Ensures that a directory exists within the application volume.
   * Creates the directory if it doesn't exist.
   * @param relativePath - Relative path segments from the application volume root.
   */
  public async ensureDir(relativePath: string[]): Promise<void> {
    const dirPath = this.joinVolumePath(relativePath);
    await this.ensureDirOutOfVolume(dirPath);
  }

  /**
   * Reads directory entries at the given relative path and returns a list of entries.
   * @param relativePath - Optional relative path segments from the application volume root.
   */
  public async readDir(relativePath?: string[]): Promise<Dirent[]> {
    const dirPathArray: string[] = [Constants.Paths.APP_VOLUME];

    if (relativePath) {
      dirPathArray.push(...relativePath);
    }

    const dirPath = path.join(...dirPathArray);
    return await fsExtra.readdir(dirPath, { withFileTypes: true });
  }

  /**
   * Removes all contents of the directory at the given relative path.
   * @param relativePath - Relative path segments from the application volume root.
   */
  public async emptyDir(relativePath: string[]): Promise<void> {
    const pathToDir = this.joinVolumePath(relativePath);
    await fsExtra.emptydir(pathToDir);
  }

  /**
   * Calculates the total size of a directory within the application volume.
   * @param relativePath - Relative path segments from the application volume root.
   * @returns Directory size in bytes.
   */
  public async dirSize(relativePath: string[]): Promise<number> {
    const dirPath = path.join(Constants.Paths.APP_VOLUME, ...relativePath);
    return await getFolderSize.loose(dirPath);
  }

  /**
   * Renames a directory from one relative path to another.
   * @param oldName - Current relative path segments.
   * @param newName - New relative path segments.
   */
  public async renameDir(oldName: string[], newName: string[]): Promise<void> {
    const oldPath = this.joinVolumePath(oldName);
    const newPath = this.joinVolumePath(newName);

    await fsExtra.rename(oldPath, newPath);
  }

  /**
   * Removes a file or directory located at the given absolute path.
   * @param pth - Absolute path to the file or directory.
   */
  public async removePathOutOfVolume(pth: string) {
    await fsExtra.remove(pth);
  }

  /**
   * Removes a file or directory located at a relative path within the application volume.
   * @param relativePath - Relative path segments from the application volume root.
   */
  public async removePath(relativePath: string[]): Promise<void> {
    const pth = this.joinVolumePath(relativePath);
    await this.removePathOutOfVolume(pth);
  }

  /**
   * Checks whether a file or directory exists at the given relative path.
   * @param relativePath - Relative path segments from the application volume root.
   * @returns True if the path exists, otherwise false.
   */
  public async pathExists(relativePath: string[]): Promise<boolean> {
    const pth = this.joinVolumePath(relativePath);
    return await fsExtra.exists(pth);
  }

  /**
   * Copies a file or directory from an absolute source path to a target relative path within the application volume.
   * @param fullSrcPath - Absolute source path.
   * @param targetRelativePath - Relative target path within the application volume.
   */
  public async copyPath(fullSrcPath: string, targetRelativePath: string[]): Promise<void> {
    const targetPath = this.joinVolumePath(targetRelativePath);
    await fsExtra.copy(fullSrcPath, targetPath);
  }

  /**
   * Copies a file or directory from one relative path to another within the application volume.
   * @param srcRelativePath - Source path segments relative to the application volume.
   * @param targetRelativePath - Target path segments relative to the application volume.
   */
  public async copyPathAtVolume(srcRelativePath: string[], targetRelativePath: string[]): Promise<void> {
    const sourcePath = this.joinVolumePath(srcRelativePath);
    await this.copyPath(sourcePath, targetRelativePath);
  }

  /**
   * Reads the contents of a text file at the given absolute path.
   * @param fullPath - Absolute path to the text file.
   * @returns File content as a string.
   */
  public async readTextFileOutOfVolume(fullPath: string): Promise<string> {
    return await fsExtra.readFile(fullPath, { encoding: DEFAULT_FILE_ENCODING });
  }

  /**
   * Reads the contents of a text file at a relative path within the application volume.
   * @param relativePath - Relative path to the text file.
   * @returns File content as a string.
   */
  public async readTextFile(relativePath: string[]): Promise<string> {
    const pathToFile = this.joinVolumePath(relativePath);
    return await this.readTextFileOutOfVolume(pathToFile);
  }

  /**
   * Writes a string to a file at a relative path within the application volume.
   * @param relativePath - Relative path to the text file.
   * @param content - Text content to write.
   */
  public async writeTextFile(relativePath: string[], content: string): Promise<void> {
    const pathToFile = this.joinVolumePath(relativePath);
    await fsExtra.writeFile(pathToFile, content, { encoding: DEFAULT_FILE_ENCODING });
  }

  /**
   * Writes binary data to a file at a relative path within the application volume.
   * @param relativePath - Relative path to the binary file.
   * @param content - Binary content to write.
   */
  public async writeBinaryFile(relativePath: string[], content: NodeJS.ArrayBufferView): Promise<void> {
    const pathToFile = this.joinVolumePath(relativePath);
    await fsExtra.writeFile(pathToFile, content);
  }

  /**
   * Streams a file from a relative path within the application volume.
   * Returns a readable stream and its MIME type.
   * @param relativePath - Relative path to the file.
   * @returns {[fsExtra.ReadStream, string]} A tuple containing the file stream and its MIME type.
   * @throws {NotFoundException} If the file does not exist.
   */
  public streamFile(relativePath: string[]): [fsExtra.ReadStream, string] {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...relativePath);
    const fileExists = fsExtra.existsSync(filePath);

    if (fileExists) {
      const readStream = createReadStream(filePath);
      const mimeType = `${mime.lookup(filePath)}`;

      return [readStream, mimeType === 'false' ? 'application/octet-stream' : mimeType];
    }

    throw new NotFoundException(LOCALE['FILE_WAS_NOT_FOUND']);
  }

  /**
   * Joins a relative path with the application volume base path.
   */
  private joinVolumePath(relativePath: string[]): string {
    return path.join(Constants.Paths.APP_VOLUME, ...relativePath);
  }
}
