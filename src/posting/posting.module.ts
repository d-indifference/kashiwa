import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { BoardController, DeletionController, PostingController } from '@posting/controllers';
import { AttachedFileService, BoardService, DeletionService, PostingService } from '@posting/services';
import { WakabaMarkdownService } from '@posting/lib';
import { RestrictionModule } from '@restriction/restriction.module';
import { CaptchaModule } from '@captcha/captcha.module';

/**
 * Module for thread posting
 */
@Module({
  imports: [
    NestjsFormDataModule.config(nestjsFormDataConfig),
    LibraryModule,
    PersistenceModule,
    RestrictionModule,
    CaptchaModule
  ],
  providers: [BoardService, PostingService, WakabaMarkdownService, AttachedFileService, DeletionService],
  controllers: [BoardController, PostingController, DeletionController]
})
export class PostingModule {}
