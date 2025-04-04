import { FileSystemStoredFile } from 'nestjs-form-data';

export class FormDto {
  file: FileSystemStoredFile;
}
