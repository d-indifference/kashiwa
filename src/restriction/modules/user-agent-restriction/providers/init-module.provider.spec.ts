import { Test, TestingModule } from '@nestjs/testing';
import { InitModuleProvider } from '@restriction/modules/user-agent-restriction/providers/init-module.provider';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { Constants } from '@library/constants';

describe('InitModuleProvider', () => {
  let provider: InitModuleProvider;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    fileSystem = {
      pathExists: jest.fn(),
      readTextFile: jest.fn()
    } as any;

    siteContext = {
      setForbiddenUserAgents: jest.fn()
    } as any;

    logger = {
      setContext: jest.fn(),
      info: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitModuleProvider,
        { provide: FileSystemProvider, useValue: fileSystem },
        { provide: SiteContextProvider, useValue: siteContext },
        { provide: PinoLogger, useValue: logger }
      ]
    }).compile();

    provider = module.get<InitModuleProvider>(InitModuleProvider);
  });

  afterEach(() => jest.clearAllMocks());

  describe('onModuleInit', () => {
    it('should trigger extractFromFile on module init', () => {
      const spy = jest.spyOn<any, any>(provider as any, 'extractFromFile').mockResolvedValue(undefined);

      provider.onModuleInit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('extractFromFile', () => {
    it('should read file and update forbidden user agents', async () => {
      fileSystem.pathExists.mockResolvedValue(true);
      fileSystem.readTextFile.mockResolvedValue('bot\r\ncurl\r\n');

      await (provider as any).extractFromFile();

      expect(logger.info).toHaveBeenCalledWith('extractFromFile');
      expect(fileSystem.pathExists).toHaveBeenCalledWith([
        Constants.SETTINGS_DIR,
        Constants.FILE_FORBIDDEN_USER_AGENTS
      ]);
      expect(siteContext.setForbiddenUserAgents).toHaveBeenCalledWith([/bot/i, /curl/i]);
    });

    it('should handle missing file gracefully', async () => {
      fileSystem.pathExists.mockResolvedValue(false);

      await (provider as any).extractFromFile();

      expect(fileSystem.readTextFile).not.toHaveBeenCalled();
      expect(siteContext.setForbiddenUserAgents).toHaveBeenCalledWith([]);
    });
  });

  describe('readFile', () => {
    it('should read and parse file when it exists', async () => {
      fileSystem.pathExists.mockResolvedValue(true);
      fileSystem.readTextFile.mockResolvedValue('line1\r\nline2\r\n\r\n');

      const result = await (provider as any).readFile();

      expect(result).toEqual(['line1', 'line2']);
    });

    it('should return empty array when file does not exist', async () => {
      fileSystem.pathExists.mockResolvedValue(false);

      const result = await (provider as any).readFile();

      expect(result).toEqual([]);
    });
  });

  describe('compileRegExps', () => {
    it('should compile array of string patterns to regex', () => {
      const patterns = ['bot', 'curl', 'spider'];
      const result = (provider as any).compileRegExps(patterns);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(RegExp);
      expect(result[0].test('BOT')).toBe(true); // case-insensitive
    });
  });
});
