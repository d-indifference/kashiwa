import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PugService } from '@library/pug/pug.service';

/**
 * Options for configuring the PugModule.
 */
export interface PugModuleOptions {
  /**
   * Absolute path to the directory containing Pug templates.
   */
  templatesPath: string;
}

/**
 * Module for local Pug rendering
 */
@Module({})
export class PugModule {
  /**
   * Registers the PugModule with given options.
   * @param options - Configuration options for the PugModule.
   */
  static forRoot(options: PugModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'PUG_OPTIONS',
        useValue: options
      },
      PugService
    ];

    return {
      module: PugModule,
      providers,
      exports: [PugService]
    };
  }
}
