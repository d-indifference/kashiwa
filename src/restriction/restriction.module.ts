import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { BanService, RestrictionService } from '@restriction/services';
import { AntiSpamModule } from '@restriction/modules/antispam/anti-spam.module';
import { CaptchaModule } from '@captcha/captcha.module';

/**
 * Module for providing posting restrictions
 */
@Module({
  imports: [LibraryModule, PersistenceModule, AntiSpamModule, CaptchaModule],
  providers: [RestrictionService, BanService],
  exports: [RestrictionService]
})
export class RestrictionModule {}
