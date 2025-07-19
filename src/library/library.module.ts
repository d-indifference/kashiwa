import { Module } from '@nestjs/common';
import { ImageboardFileProvider } from '@library/filesystem';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [ImageboardFileProvider],
  exports: [ImageboardFileProvider]
})
export class LibraryModule {}
