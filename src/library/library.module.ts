import { Module } from '@nestjs/common';
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

/**
 * Module for library / shared functionality & utils
 */
@Module({
  imports: [ScheduleModule.forRoot()],
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
