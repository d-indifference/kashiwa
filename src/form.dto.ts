import { MemoryStoredFile } from 'nestjs-form-data';

export class FormDto {
  file: MemoryStoredFile;
}
