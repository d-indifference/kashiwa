import { Module } from '@nestjs/common';
import { CaptchaGeneratorProvider, CaptchaSolvingPredicateProvider } from '@captcha/providers';
import { ConfigModule } from '@nestjs/config';

/**
 * Module for providing captcha generations and checking
 */
@Module({
  imports: [ConfigModule],
  providers: [CaptchaGeneratorProvider, CaptchaSolvingPredicateProvider],
  exports: [CaptchaGeneratorProvider, CaptchaSolvingPredicateProvider]
})
export class CaptchaModule {}
