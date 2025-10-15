import { Injectable } from '@nestjs/common';
import { FileSystemProvider } from '@library/providers/file-system.provider';
import { SiteContextProvider } from '@library/providers/site-context.provider';
import { Constants } from '@library/constants';
import * as path from 'node:path';

/**
 * Provider responsible for initializing and managing the list of allowed CORS origins
 * for the current site context.
 *
 * The provider ensures that a file containing the list of allowed origins exists.
 * If the file is missing, it loads a preset version from the predefined presets directory,
 * normalizes its content, and writes it to the settings directory.
 *
 * Once the file is available, it reads and parses the allowed origins,
 * then updates the {@link SiteContextProvider} with this list.
 */
@Injectable()
export class CorsAllowedOriginsProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider
  ) {}

  /**
   * Loads and applies the allowed CORS origins configuration.
   */
  public async load(): Promise<void> {
    const filePath = [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS];

    if (!(await this.fileSystem.pathExists(filePath))) {
      const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_ALLOWED_ORIGINS);

      const presetContent = await this.fileSystem.readTextFileOutOfVolume(presetPath);

      const normalizedPresetContent = presetContent
        .split('\n')
        .filter(str => str !== '')
        .join('\r\n');

      await this.fileSystem.writeTextFile(filePath, normalizedPresetContent);
    }

    const allowedOriginsContent = await this.fileSystem.readTextFile(filePath);
    const allowedOrigins = allowedOriginsContent.split('\r\n').filter(str => str !== '');

    this.siteContext.setCorsAllowedOrigins(allowedOrigins);
  }
}
