import { forwardRef, Module } from '@nestjs/common';
import { LibraryModule } from '@library/library.module';
import { ForbiddenUserAgentsProvider, InitModuleProvider } from '@restriction/modules/user-agent-restriction/providers';

/**
 * Module for working with forbidden user-agent patterns
 */
@Module({
  imports: [forwardRef(() => LibraryModule)],
  providers: [InitModuleProvider, ForbiddenUserAgentsProvider],
  exports: [ForbiddenUserAgentsProvider]
})
export class UserAgentRestrictionModule {}
