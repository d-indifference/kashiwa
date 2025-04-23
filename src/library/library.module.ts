import { Module } from '@nestjs/common';
import { BoardPageCompilerService, ThreadPageCompilerService } from 'src/library/page-compiler';
import { ImageboardFileProvider } from '@library/filesystem';
import { ThreadMapper } from '@library/mappers';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  providers: [ImageboardFileProvider, ThreadPageCompilerService, ThreadMapper, BoardPageCompilerService],
  exports: [ImageboardFileProvider, ThreadPageCompilerService, ThreadMapper, BoardPageCompilerService]
})
export class LibraryModule {}
