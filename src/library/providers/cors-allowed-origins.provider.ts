import { Injectable } from '@nestjs/common';
import { FileSystemProvider } from '@library/providers/file-system.provider';
import { SiteContextProvider } from '@library/providers/site-context.provider';
import { Constants } from '@library/constants';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';

/**
 * Provider responsible for initializing and managing the list of allowed CORS origins for the current site context
 */
@Injectable()
export class CorsAllowedOriginsProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider,
    private readonly config: ConfigService
  ) {}

  /**
   * Loads and applies the allowed CORS origins configuration.
   */
  public async load(): Promise<void> {
    const filePath = [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS];

    if (!(await this.fileSystem.pathExists(filePath))) {
      const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_ALLOWED_ORIGINS);

      const defaultPreset = this.config.getOrThrow<string[]>('http.cors.allowed-origins.default-preset');

      const presetContent = await this.fileSystem.readTextFileOutOfVolume(presetPath);

      const normalizedPresetContent = presetContent.split('\n').filter(str => str !== '');

      normalizedPresetContent.push(...defaultPreset);

      await this.fileSystem.writeTextFile(filePath, normalizedPresetContent.join('\r\n'));
    }

    const allowedOriginsContent = await this.fileSystem.readTextFile(filePath);
    const allowedOrigins = allowedOriginsContent.split('\r\n').filter(str => str !== '');

    this.siteContext.setCorsAllowedOrigins(allowedOrigins);
  }
}
