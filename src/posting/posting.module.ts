import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { FormFileProvider, MediaFileHandlerProvider, WakabaMarkdownProvider } from '@posting/providers';
import { AttachedFileService, CatalogService, CommentCreateService, CommentDeleteService } from '@posting/services';
import { DeletionController, ForumController, PostingController } from '@posting/controllers';
import { CachingModule } from '@caching/caching.module';
import { RestrictionModule } from '@restriction/restriction.module';
import { WhoisModule } from '@whois/whois.module';

/**
 * Module for thread posting
 */
@Module({
  imports: [
    NestjsFormDataModule.config(nestjsFormDataConfig),
    LibraryModule,
    PersistenceModule,
    CachingModule,
    RestrictionModule,
    WhoisModule
  ],
  providers: [
    FormFileProvider,
    WakabaMarkdownProvider,
    MediaFileHandlerProvider,
    CommentCreateService,
    AttachedFileService,
    CommentDeleteService,
    CatalogService
  ],
  controllers: [PostingController, DeletionController, ForumController]
})
export class PostingModule {}
