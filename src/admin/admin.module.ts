import { Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import {
  AuthController,
  BanController,
  BoardController,
  DashboardController,
  DumpController,
  GlobalSettingsController,
  IpFilterController,
  ModerationController,
  SpamController,
  StaffController
} from '@admin/controllers';
import { PersistenceModule } from '@persistence/persistence.module';
import {
  AuthService,
  BanService,
  BoardService,
  DashboardService,
  DumpService,
  GlobalSettingsService,
  IpFilterService,
  ModerationService,
  SpamService,
  StaffService
} from '@admin/services';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PrismaService } from '@persistence/lib';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { CaptchaModule } from '@captcha/captcha.module';
import { PostingModule } from '@posting/posting.module';

/**
 * Module for administration / moderation panel
 */
@Module({
  imports: [
    NestjsFormDataModule.config(nestjsFormDataConfig),
    LibraryModule,
    PersistenceModule,
    CaptchaModule,
    PostingModule
  ],
  providers: [
    PrismaService,
    AuthService,
    DashboardService,
    StaffService,
    BoardService,
    ModerationService,
    SpamService,
    IpFilterService,
    BanService,
    GlobalSettingsService,
    DumpService
  ],
  controllers: [
    AuthController,
    DashboardController,
    StaffController,
    BoardController,
    ModerationController,
    SpamController,
    IpFilterController,
    BanController,
    GlobalSettingsController,
    DumpController
  ]
})
export class AdminModule {}
