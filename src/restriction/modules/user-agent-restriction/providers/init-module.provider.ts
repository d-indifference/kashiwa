import { Injectable, OnModuleInit } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { UserAgentRestrictionModule } from '@restriction/modules/user-agent-restriction/user-agent-restriction.module';
import { Constants } from '@library/constants';

/**
 * Service responsible for initializing the forbidden user agents list from persistent storage when the module is loaded
 */
@Injectable()
export class InitModuleProvider implements OnModuleInit {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(`${UserAgentRestrictionModule.name}.${InitModuleProvider.name}`);
  }

  public onModuleInit(): void {
    this.extractFromFile().then();
  }

  /**
   * Reads the forbidden user agents from persistent storage and updates the site context with compiled RegExp patterns
   */
  private async extractFromFile(): Promise<void> {
    this.logger.info('extractFromFile');

    const storageFileContent = await this.readFile();
    this.siteContext.setForbiddenUserAgents(this.compileRegExps(storageFileContent));
  }

  /**
   * Compiles an array of string patterns into case-insensitive regular expressions
   */
  private compileRegExps(regExpsSources: string[]): RegExp[] {
    return regExpsSources.map(pattern => new RegExp(pattern, 'i'));
  }

  /**
   * Reads the forbidden user agents file from disk and splits it into lines
   */
  private async readFile(): Promise<string[]> {
    const fileRelativePath = [Constants.SETTINGS_DIR, Constants.FILE_FORBIDDEN_USER_AGENTS];

    const isFileExists = await this.fileSystem.pathExists(fileRelativePath);

    if (isFileExists) {
      const fileContent = await this.fileSystem.readTextFile(fileRelativePath);

      return fileContent.split('\r\n').filter(str => str !== '');
    }

    return [];
  }
}
