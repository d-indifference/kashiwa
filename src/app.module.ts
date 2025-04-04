import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import * as path from 'node:path';

@Module({
  imports: [
    NestjsFormDataModule.config({
      storage: FileSystemStoredFile,
      fileSystemStoragePath: path.join(process.cwd(), 'volumes')
    })
  ],
  controllers: [TestingController],
  providers: []
})
export class AppModule {}
