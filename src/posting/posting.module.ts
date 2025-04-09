import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';

/**
 * Module for thread posting
 */
@Module({
  imports: [NestjsFormDataModule.config(nestjsFormDataConfig), LibraryModule, PersistenceModule],
  providers: [],
  controllers: []
})
export class PostingModule {}
