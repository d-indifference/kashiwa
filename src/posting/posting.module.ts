import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { RestrictionModule } from '@restriction/restriction.module';
import { CaptchaModule } from '@captcha/captcha.module';

/**
 * Module for thread posting
 */
@Module({
  imports: [
    NestjsFormDataModule.config(nestjsFormDataConfig),
    LibraryModule,
    PersistenceModule,
    RestrictionModule,
    CaptchaModule
  ],
  providers: [],
  controllers: [],
  exports: []
})
export class PostingModule {}
