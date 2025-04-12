import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { BoardController } from '@posting/controllers';
import { BoardService } from '@posting/services';

/**
 * Module for thread posting
 */
@Module({
  imports: [NestjsFormDataModule.config(nestjsFormDataConfig), LibraryModule, PersistenceModule],
  providers: [BoardService],
  controllers: [BoardController]
})
export class PostingModule {}
