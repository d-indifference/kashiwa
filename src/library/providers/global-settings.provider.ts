import { Injectable } from '@nestjs/common';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import path from 'node:path';
import { Constants } from '@library/constants';
import { GlobalSettingsForm } from '@admin/forms';

/**
 * Provider for global setting uploading
 */
@Injectable()
export class GlobalSettingsProvider {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly siteContext: SiteContextProvider
  ) {}

  /**
   * Load global site settings to memory.
   * If global settings aren't presented, loads it from preset
   */
  public async load(): Promise<void> {
    const filePath = [Constants.SETTINGS_DIR, Constants.FILE_GLOBAL_SETTINGS];

    if (!(await this.fileSystem.pathExists(filePath))) {
      const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_GLOBAL_SETTINGS);

      await this.fileSystem.copyPath(presetPath, filePath);
    }
    const fileContent = await this.fileSystem.readTextFile(filePath);
    this.siteContext.setGlobalSettings(JSON.parse(fileContent) as GlobalSettingsForm);
  }
}
