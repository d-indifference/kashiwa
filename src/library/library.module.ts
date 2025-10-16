import { forwardRef, Module } from '@nestjs/common';
import {
  FileSystemProvider,
  InMemoryCacheProvider,
  IpBlacklistProvider,
  SiteContextProvider,
  CacheCronOperationsProvider,
  SwaggerSetupProvider,
  CorsAllowedOriginsProvider
} from '@library/providers';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAgentRestrictionModule } from '@restriction/modules/user-agent-restriction/user-agent-restriction.module';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => UserAgentRestrictionModule)],
  providers: [
    FileSystemProvider,
    IpBlacklistProvider,
    InMemoryCacheProvider,
    SiteContextProvider,
    SwaggerSetupProvider,
    CacheCronOperationsProvider,
    CorsAllowedOriginsProvider
  ],
  exports: [FileSystemProvider, IpBlacklistProvider, InMemoryCacheProvider, SiteContextProvider, SwaggerSetupProvider]
})
export class LibraryModule {}
