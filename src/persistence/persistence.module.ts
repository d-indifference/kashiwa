import { Module } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { ConfigModule } from '@nestjs/config';
import { BoardMapper, CommentMapper, UserMapper } from '@persistence/mappers';
import { AttachedFilePersistenceService, BoardPersistenceService, UserPersistenceService } from '@persistence/services';
import { CommentPersistenceService } from '@persistence/services/comment.persistence.service';

/**
 * Module for Prisma queries
 */
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    UserMapper,
    UserPersistenceService,
    BoardMapper,
    BoardPersistenceService,
    CommentMapper,
    CommentPersistenceService,
    AttachedFilePersistenceService
  ],
  exports: [UserPersistenceService, BoardPersistenceService, CommentPersistenceService, AttachedFilePersistenceService]
})
export class PersistenceModule {}
