import * as path from 'node:path';
import { FileSystemStoredFile } from 'nestjs-form-data';
import * as process from 'node:process';
import * as fsExtra from 'fs-extra';

interface IFile {
  originalName: string;

  mimeType: string;

  path: string;

  ext: string;

  size: number;
}

export class FilesystemOperator {
  private readonly file: IFile;

  private targetPath?: string;

  private newName?: string;

  private constructor(file: IFile) {
    this.file = file;
  }

  public static fromFormData(formData: FileSystemStoredFile): FilesystemOperator {
    return new FilesystemOperator({
      originalName: formData.originalName,
      mimeType: formData.mimeType,
      path: path.dirname(formData.path),
      ext: formData.extension,
      size: formData.size
    });
  }

  public toTarget(...target: string[]): FilesystemOperator {
    this.targetPath = path.join(process.cwd(), 'volumes', ...target);

    return this;
  }

  public setNewName(newName: string): FilesystemOperator {
    this.newName = newName;

    return this;
  }

  public async save(): Promise<IFile> {
    let saveFilePath: string = path.join(process.cwd(), 'volumes');

    if (this.targetPath) {
      await fsExtra.ensureDir(this.targetPath);
      saveFilePath = this.targetPath;
    }

    if (this.newName) {
      saveFilePath = path.join(saveFilePath, `${this.newName}.${this.file.ext}`);
    } else {
      saveFilePath = path.join(saveFilePath, this.file.originalName);
    }

    await fsExtra.move(this.toFilePath(), saveFilePath, { overwrite: false });

    this.file.path = saveFilePath;
    this.file.originalName = this.newName ?? this.file.originalName;

    return this.file;
  }

  private toFilePath(): string {
    return path.join(this.file.path, this.file.originalName);
  }
}
