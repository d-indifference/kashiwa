import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { BoardController, PostingController } from '@posting/controllers';
import { AttachedFileService, BoardService, PostingService } from '@posting/services';
import { WakabaMarkdownService } from '@posting/lib';

/**
 * Module for thread posting
 */
@Module({
  imports: [NestjsFormDataModule.config(nestjsFormDataConfig), LibraryModule, PersistenceModule],
  providers: [BoardService, PostingService, WakabaMarkdownService, AttachedFileService],
  controllers: [BoardController, PostingController]
})
export class PostingModule {}
