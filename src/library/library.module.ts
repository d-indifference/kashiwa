import { Module } from '@nestjs/common';
import { ImageboardFileProvider } from './filesystem';

/**
 * Module for library / shared functionality & utils
 */
@Module({
  imports: [],
  providers: [ImageboardFileProvider],
  exports: [ImageboardFileProvider]
})
export class LibraryModule {}
