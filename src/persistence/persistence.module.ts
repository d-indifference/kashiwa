import { Module } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { ConfigModule } from '@nestjs/config';
import { BoardMapper, UserMapper } from '@persistence/mappers';
import { BoardPersistenceService, UserPersistenceService } from '@persistence/services';

/**
 * Module for Prisma queries
 */
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, UserMapper, UserPersistenceService, BoardMapper, BoardPersistenceService],
  exports: [UserPersistenceService, BoardPersistenceService]
})
export class PersistenceModule {}
