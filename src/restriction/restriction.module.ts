import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { RestrictionService } from '@restriction/services';
import { AntiSpamModule } from '@restriction/modules/antispam/anti-spam.module';

/**
 * Module for providing posting restrictions
 */
@Module({
  imports: [LibraryModule, PersistenceModule, AntiSpamModule],
  providers: [RestrictionService],
  exports: [RestrictionService]
})
export class RestrictionModule {}
