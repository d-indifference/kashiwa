import { Module } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { ConfigModule } from '@nestjs/config';
import { UserMapper } from '@persistence/mappers';
import { UserPersistenceService } from '@persistence/services';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService, UserMapper, UserPersistenceService],
  exports: [UserPersistenceService]
})
export class PersistenceModule {}
