import { Module } from '@nestjs/common';
import { CachingProvider, CachingUpdateProvider } from '@caching/providers';
import { PersistenceModule } from '@persistence/persistence.module';
import { CaptchaModule } from '@captcha/captcha.module';
import { LibraryModule } from '@library/library.module';

@Module({
  imports: [PersistenceModule, LibraryModule, CaptchaModule],
  providers: [CachingProvider, CachingUpdateProvider],
  exports: [CachingProvider]
})
export class CachingModule {}
