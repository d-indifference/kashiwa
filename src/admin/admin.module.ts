import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';
import { LibraryModule } from '@library/library.module';
import { PersistenceModule } from '@persistence/persistence.module';
import { PrismaService } from '@persistence/lib';
import { ProtectSignInMiddleware, ProtectSignUpMiddleware, RedirectForSignInMiddleware } from '@admin/middlewares';
import {
  AuthService,
  BanService,
  BoardService,
  CorsSettingsService,
  DashboardService,
  DumpService,
  UserAgentFilterService,
  GlobalSettingsService,
  IpFilterService,
  ModerationService,
  SpamListService,
  StaffService,
  ReportService
} from '@admin/services';
import {
  AuthController,
  DashboardController,
  GlobalSettingsController,
  SpamListController,
  IpFilterController,
  DumpController,
  StaffController,
  BoardController,
  BanController,
  ModerationController,
  CorsSettingsController,
  UserAgentFilterController,
  ReportController
} from '@admin/controllers';
import { DashboardUtilsProvider, DatabaseDumpingUtilsProvider } from '@admin/providers';
import { ScheduleModule } from '@nestjs/schedule';
import { CachingModule } from '@caching/caching.module';
import { AntiSpamModule } from '@restriction/modules/antispam/anti-spam.module';
import { UserAgentRestrictionModule } from '@restriction/modules/user-agent-restriction/user-agent-restriction.module';

/**
 * Module for administration panel
 */
@Module({
  imports: [
    NestjsFormDataModule.config(nestjsFormDataConfig),
    ScheduleModule.forRoot(),
    LibraryModule,
    PersistenceModule,
    CachingModule,
    AntiSpamModule,
    UserAgentRestrictionModule
  ],
  providers: [
    PrismaService,
    AuthService,
    DashboardService,
    DashboardUtilsProvider,
    GlobalSettingsService,
    SpamListService,
    IpFilterService,
    DumpService,
    DatabaseDumpingUtilsProvider,
    StaffService,
    BoardService,
    BanService,
    ModerationService,
    CorsSettingsService,
    UserAgentFilterService,
    ReportService
  ],
  controllers: [
    AuthController,
    DashboardController,
    GlobalSettingsController,
    SpamListController,
    IpFilterController,
    DumpController,
    StaffController,
    BoardController,
    BanController,
    ModerationController,
    CorsSettingsController,
    UserAgentFilterController,
    ReportController
  ]
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectSignUpMiddleware).forRoutes({ path: '/kashiwa/auth/sign-up', method: RequestMethod.ALL });
    consumer.apply(ProtectSignInMiddleware).forRoutes({ path: '/kashiwa/auth/sign-in', method: RequestMethod.ALL });
    consumer.apply(RedirectForSignInMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
