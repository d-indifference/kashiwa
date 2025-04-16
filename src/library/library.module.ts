import { Module } from '@nestjs/common';
import { PageCompilerService } from 'src/library/page-compiler';
import { ImageboardFileProvider } from '@library/filesystem';
import { ThreadMapper } from '@library/mappers';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [ImageboardFileProvider, PageCompilerService, ThreadMapper],
  exports: [ImageboardFileProvider, PageCompilerService, ThreadMapper]
})
export class LibraryModule {}
