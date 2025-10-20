import { CorsAllowedOriginsProvider } from './cors-allowed-origins.provider';
import { FileSystemProvider } from '@library/providers/file-system.provider';
import { SiteContextProvider } from '@library/providers/site-context.provider';
import { Constants } from '@library/constants';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';

describe('CorsAllowedOriginsProvider', () => {
  let provider: CorsAllowedOriginsProvider;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(() => {
    fileSystem = {
      pathExists: jest.fn(),
      readTextFileOutOfVolume: jest.fn(),
      readTextFile: jest.fn(),
      writeTextFile: jest.fn()
    } as any;

    siteContext = {
      setCorsAllowedOrigins: jest.fn()
    } as any;

    config = {
      getOrThrow: jest.fn()
    } as any;

    provider = new CorsAllowedOriginsProvider(fileSystem, siteContext, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load allowed origins if the file already exists', async () => {
    fileSystem.pathExists.mockResolvedValue(true);
    fileSystem.readTextFile.mockResolvedValue('https://foo.com\r\nhttps://bar.com');

    await provider.load();

    expect(fileSystem.pathExists).toHaveBeenCalledWith([Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS]);
    expect(fileSystem.readTextFile).toHaveBeenCalled();
    expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith(['https://foo.com', 'https://bar.com']);
    expect(fileSystem.writeTextFile).not.toHaveBeenCalled();
    expect(fileSystem.readTextFileOutOfVolume).not.toHaveBeenCalled();
    expect(config.getOrThrow).not.toHaveBeenCalled();
  });

  it('should create a file from the preset and default preset if the file does not exist', async () => {
    fileSystem.pathExists.mockResolvedValue(false);
    fileSystem.readTextFileOutOfVolume.mockResolvedValue('https://preset.com\nhttps://example.com');
    fileSystem.readTextFile.mockResolvedValue(
      'https://preset.com\r\nhttps://example.com\r\nhttps://default1.com\r\nhttps://default2.com'
    );

    config.getOrThrow.mockReturnValue(['https://default1.com', 'https://default2.com']);

    await provider.load();

    const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_ALLOWED_ORIGINS);

    expect(fileSystem.readTextFileOutOfVolume).toHaveBeenCalledWith(presetPath);
    expect(config.getOrThrow).toHaveBeenCalledWith('http.cors.allowed-origins.default-preset');

    expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
      [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS],
      'https://preset.com\r\nhttps://example.com\r\nhttps://default1.com\r\nhttps://default2.com'
    );

    expect(fileSystem.readTextFile).toHaveBeenCalled();
    expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith([
      'https://preset.com',
      'https://example.com',
      'https://default1.com',
      'https://default2.com'
    ]);
  });

  it('should skip empty lines when reading presets and allowed origins', async () => {
    fileSystem.pathExists.mockResolvedValue(false);
    fileSystem.readTextFileOutOfVolume.mockResolvedValue('\nhttps://preset.com\n\n');
    config.getOrThrow.mockReturnValue(['https://default1.com']);
    fileSystem.readTextFile.mockResolvedValue('https://preset.com\r\nhttps://default1.com');

    await provider.load();

    expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
      [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS],
      'https://preset.com\r\nhttps://default1.com'
    );
    expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith(['https://preset.com', 'https://default1.com']);
  });
});
