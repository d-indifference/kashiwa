import { Module } from '@nestjs/common';
import { AntiSpamService, InitModuleService } from '@restriction/modules/antispam/services';

/**
 * Module for spamming protection
 */
@Module({
  providers: [InitModuleService, AntiSpamService],
  exports: [AntiSpamService]
})
export class AntiSpamModule {}
