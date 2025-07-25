import { Module } from '@nestjs/common';
import { FileSystemProvider, GlobalSettingsProvider, IpBlacklistProvider } from '@library/providers';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [FileSystemProvider, IpBlacklistProvider, GlobalSettingsProvider],
  exports: [FileSystemProvider, IpBlacklistProvider, GlobalSettingsProvider]
})
export class LibraryModule {}
