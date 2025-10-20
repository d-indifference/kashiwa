import { forwardRef, Module } from '@nestjs/common';
import { AttachedFileMapper, CommentMapper } from '@api/mappers';
import { PersistenceModule } from '@persistence/persistence.module';
import { CommentService, ReportService } from '@api/services';
import { CommentController, ReportController } from '@api/controllers/v1';
import { LibraryModule } from '@library/library.module';
import { ProtectApiProvider } from '@api/providers';

/**
 * Module for REST API interface
 */
@Module({
  imports: [forwardRef(() => PersistenceModule), forwardRef(() => LibraryModule)],
  providers: [AttachedFileMapper, CommentMapper, CommentService, ReportService, ProtectApiProvider],
  controllers: [ReportController, CommentController]
})
export class ApiModule {}
