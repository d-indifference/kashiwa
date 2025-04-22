import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { BanService, RestrictionService } from '@restriction/services';
import { AntiSpamModule } from '@restriction/modules/antispam/anti-spam.module';

/**
 * Module for providing posting restrictions
 */
@Module({
  imports: [LibraryModule, PersistenceModule, AntiSpamModule],
  providers: [RestrictionService, BanService],
  exports: [RestrictionService]
})
export class RestrictionModule {}
