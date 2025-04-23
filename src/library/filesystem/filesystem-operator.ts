import * as path from 'node:path';
import { MemoryStoredFile } from 'nestjs-form-data';
import * as fsExtra from 'fs-extra';
import getFolderSize from 'get-folder-size';
import { NotFoundException } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as mime from 'mime-types';
import * as crypto from 'node:crypto';
import { Constants } from '@library/constants';
import { IFile } from '@library/filesystem/file.interface';

/**
 * Operator for application volume filesystem.
 */
export class FilesystemOperator {
  private readonly file: IFile;

  private readonly buffer: Buffer<ArrayBufferLike>;

  private newName?: string;

  private constructor(file: IFile, buffer: Buffer<ArrayBufferLike>) {
    this.file = file;
    this.buffer = buffer;
  }

  /**
   * Handle file from form data
   * @param formData File from form in-memory
   */
  public static fromFormData(formData: MemoryStoredFile): FilesystemOperator {
    return new FilesystemOperator(
      {
        originalName: formData.originalName,
        mimeType: formData.mimeType,
        path: Constants.Paths.APP_VOLUME,
        ext: formData.extension,
        size: formData.size
      },
      formData.buffer
    );
  }

  /**
   * Calculates MD5 of file buffer
   * @param buffer In-memory file buffer
   */
  public static md5(buffer: Buffer<ArrayBufferLike>): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Makes a directory structure. If the directory structure does not exist, it is created.
   * @param pth Path fragments in app volume
   */
  public static async mkdir(...pth: string[]): Promise<void> {
    const dirPath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    await fsExtra.ensureDir(dirPath);
  }

  public static async renameDir(pth: string[], oldName: string, newName: string): Promise<void> {
    const dirPath = path.join(Constants.Paths.APP_VOLUME, ...pth);
    const oldPath = path.join(dirPath, oldName);
    const newPath = path.join(dirPath, newName);

    await fsExtra.rename(oldPath, newPath);
  }

  /**
   * Removes path in application volume. If the path does not exist, silently does nothing.
   * @param pth Path fragments in app volume
   */
  public static async remove(...pth: string[]): Promise<void> {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    await fsExtra.remove(filePath);
  }

  /**
   * Removes all files by their extension in application volume. If the path does not exist, silently does nothing.
   * @param pth Path fragments in the app volume
   * @param ext File extension without '.'
   */
  public static async removeAllFilesByExt(pth: string[], ext: string): Promise<void> {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    const files = await fsExtra.readdir(filePath);

    for (const file of files) {
      const fullPath = path.join(filePath, file);

      if (file.endsWith(`.${ext}`)) {
        await fsExtra.remove(fullPath);
      }
    }
  }

  /**
   * Returns the size of the folder.
   * @param pth Path fragments in app volume
   */
  public static async dirSize(...pth: string[]): Promise<number> {
    const dirPath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    return await getFolderSize.loose(dirPath);
  }

  /**
   * Streams a file to HTTP controller. If file doesn't found, throws 404.
   * @param pth Path fragments in app volume
   */
  public static streamFile(...pth: string[]): [fsExtra.ReadStream, string] {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...pth);
    try {
      const readStream = createReadStream(filePath);

      const mimeType = `${mime.lookup(filePath)}`;

      return [readStream, mimeType === 'false' ? 'application/octet-stream' : mimeType];
    } catch {
      throw new NotFoundException('File was not found');
    }
  }

  /**
   * Reads a file as string.
   * @param pth Path fragments in app volume
   */
  public static readFile(...pth: string[]): string {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    return fsExtra.readFileSync(filePath, 'utf8');
  }

  /**
   * Overwrites a text file.
   * @param pth Path fragments in app volume
   * @param content New file content
   */
  public static async overwriteFile(pth: string[], content: string): Promise<void> {
    const filePath = path.join(Constants.Paths.APP_VOLUME, ...pth);

    await fsExtra.writeFile(filePath, content, { encoding: 'utf-8' });
  }

  /**
   * Sets a target storage to uploaded file from form.
   * @param target File path in volume of application
   */
  public toTarget(...target: string[]): FilesystemOperator {
    this.file.path = path.join(this.file.path, ...target);

    return this;
  }

  /**
   * Sets a new name to uploaded file from form.
   * @param newName New file name
   */
  public setNewName(newName: string): FilesystemOperator {
    this.newName = newName;

    return this;
  }

  /**
   * Saves form-uploaded file to app volume
   */
  public async save(): Promise<IFile> {
    await fsExtra.ensureDir(this.file.path);

    if (this.newName) {
      this.file.originalName = `${this.newName}.${this.file.ext}`;
    }

    const filePath = this.toFilePath();

    if (fsExtra.existsSync(filePath)) {
      await FilesystemOperator.remove(filePath);
    }

    await fsExtra.writeFile(this.toFilePath(), this.buffer);

    return this.file;
  }

  /**
   * Full path to saving of current file
   */
  private toFilePath(): string {
    return path.join(this.file.path, this.file.originalName);
  }
}
