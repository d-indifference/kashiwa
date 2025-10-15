import { CorsAllowedOriginsProvider } from './cors-allowed-origins.provider';
import { FileSystemProvider } from '@library/providers/file-system.provider';
import { SiteContextProvider } from '@library/providers/site-context.provider';
import { Constants } from '@library/constants';
import * as path from 'node:path';

describe('CorsAllowedOriginsProvider', () => {
  let provider: CorsAllowedOriginsProvider;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;

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

    provider = new CorsAllowedOriginsProvider(fileSystem, siteContext);
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
  });

  it('should create a file from the preset and load the allowed origins if the file does not exist', async () => {
    fileSystem.pathExists.mockResolvedValue(false);
    fileSystem.readTextFileOutOfVolume.mockResolvedValue('https://preset.com\nhttps://example.com');
    fileSystem.readTextFile.mockResolvedValue('https://preset.com\r\nhttps://example.com');

    await provider.load();

    const presetPath = path.join(Constants.Paths.PRESETS, Constants.FILE_ALLOWED_ORIGINS);

    expect(fileSystem.readTextFileOutOfVolume).toHaveBeenCalledWith(presetPath);
    expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
      [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS],
      'https://preset.com\r\nhttps://example.com'
    );
    expect(fileSystem.readTextFile).toHaveBeenCalled();
    expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith(['https://preset.com', 'https://example.com']);
  });
});
