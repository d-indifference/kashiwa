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
  DashboardService,
  DumpService,
  GlobalSettingsService,
  IpFilterService,
  SpamListService,
  StaffService
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
  BanController
} from '@admin/controllers';
import { DashboardUtilsProvider, DatabaseDumpingUtilsProvider } from '@admin/providers';
import { CachingProvider } from '@library/providers';

@Module({
  imports: [NestjsFormDataModule.config(nestjsFormDataConfig), LibraryModule, PersistenceModule],
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
    CachingProvider,
    BoardService,
    BanService
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
    BanController
  ]
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProtectSignUpMiddleware).forRoutes({ path: '/kashiwa/auth/sign-up', method: RequestMethod.ALL });
    consumer.apply(ProtectSignInMiddleware).forRoutes({ path: '/kashiwa/auth/sign-in', method: RequestMethod.ALL });
    consumer.apply(RedirectForSignInMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
