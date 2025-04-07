import { Module } from '@nestjs/common';
import { PageCompilerService } from 'src/library/page-compiler';
import { ImageboardFileProvider } from '@library/filesystem';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [ImageboardFileProvider, PageCompilerService],
  exports: [ImageboardFileProvider, PageCompilerService]
})
export class LibraryModule {}
