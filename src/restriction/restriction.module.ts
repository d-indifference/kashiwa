import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { RestrictionService } from '@restriction/services';

/**
 * Module for providing posting restrictions
 */
@Module({
  imports: [LibraryModule, PersistenceModule],
  providers: [RestrictionService],
  exports: [RestrictionService]
})
export class RestrictionModule {}
