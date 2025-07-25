import { Module } from '@nestjs/common';
import { AntiSpamService, InitModuleService } from '@restriction/modules/antispam/services';
import { LibraryModule } from '@library/library.module';

/**
 * Module for spamming protection
 */
@Module({
  imports: [LibraryModule],
  providers: [InitModuleService, AntiSpamService],
  exports: [AntiSpamService]
})
export class AntiSpamModule {}
