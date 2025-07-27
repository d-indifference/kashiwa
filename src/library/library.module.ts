import { Module } from '@nestjs/common';
import {
  FileSystemProvider,
  InMemoryCacheProvider,
  IpBlacklistProvider,
  SiteContextProvider
} from '@library/providers';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [FileSystemProvider, IpBlacklistProvider, InMemoryCacheProvider, SiteContextProvider],
  exports: [FileSystemProvider, IpBlacklistProvider, InMemoryCacheProvider, SiteContextProvider]
})
export class LibraryModule {}
