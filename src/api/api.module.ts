import { forwardRef, Module } from '@nestjs/common';
import { AttachedFileMapper, CommentMapper } from '@api/mappers';
import { PersistenceModule } from '@persistence/persistence.module';
import { CommentService } from '@api/services';
import { CommentController } from '@api/controllers/v1';
import { LibraryModule } from '@library/library.module';

/**
 * Module for REST API interface
 */
@Module({
  imports: [forwardRef(() => PersistenceModule), forwardRef(() => LibraryModule)],
  providers: [AttachedFileMapper, CommentMapper, CommentService],
  controllers: [CommentController]
})
export class ApiModule {}
