import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { ConfigModule } from '@nestjs/config';
import { BanMapper, BoardMapper, CommentMapper, UserMapper } from '@persistence/mappers';
import {
  AttachedFilePersistenceService,
  BoardPersistenceService,
  UserPersistenceService,
  CommentPersistenceService,
  BanPersistenceService
} from '@persistence/services';
import { LibraryModule } from '@library/library.module';

/**
 * Module for Prisma queries
 */
@Module({
  imports: [ConfigModule, forwardRef(() => LibraryModule)],
  providers: [
    PrismaService,
    UserMapper,
    UserPersistenceService,
    BoardMapper,
    BoardPersistenceService,
    CommentMapper,
    CommentPersistenceService,
    AttachedFilePersistenceService,
    BanMapper,
    BanPersistenceService
  ],
  exports: [
    UserPersistenceService,
    BoardPersistenceService,
    CommentPersistenceService,
    AttachedFilePersistenceService,
    BanPersistenceService
  ]
})
export class PersistenceModule {}
