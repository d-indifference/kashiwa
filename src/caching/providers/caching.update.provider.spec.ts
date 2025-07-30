import { CachingUpdateProvider } from './caching.update.provider';
import { BoardPersistenceService, CommentPersistenceService } from '@persistence/services';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { CaptchaGeneratorProvider } from '@captcha/providers';
import { Constants } from '@library/constants';

jest.mock('pug', () => ({
  compileFile: jest.fn(() => jest.fn(() => '<html>test</html>'))
}));

describe('CachingUpdateProvider', () => {
  let provider: CachingUpdateProvider;
  let commentPersistenceService: jest.Mocked<CommentPersistenceService>;
  let boardPersistenceService: jest.Mocked<BoardPersistenceService>;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let captchaGeneratorProvider: jest.Mocked<CaptchaGeneratorProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;

  beforeEach(() => {
    commentPersistenceService = {
      findThreadNums: jest.fn(),
      findThread: jest.fn(),
      findAll: jest.fn()
    } as any;
    boardPersistenceService = {
      findByUrl: jest.fn()
    } as any;
    fileSystem = {
      writeTextFile: jest.fn()
    } as any;
    captchaGeneratorProvider = {
      generate: jest.fn()
    } as any;
    siteContext = {
      getGlobalSettings: jest.fn()
    } as any;
    provider = new CachingUpdateProvider(
      commentPersistenceService,
      boardPersistenceService,
      fileSystem,
      captchaGeneratorProvider,
      siteContext
    );
  });

  describe('fullyReloadCache', () => {
    it('should reload board pages and thread pages', async () => {
      commentPersistenceService.findThreadNums.mockResolvedValue([1n, 2n]);
      jest.spyOn(provider as any, 'compileBoardPages').mockResolvedValue(undefined);
      jest.spyOn(provider as any, 'reloadThreadPage').mockResolvedValue(undefined);
      await provider.fullyReloadCache('b');
      expect(commentPersistenceService.findThreadNums).toHaveBeenCalledWith('b');
      expect((provider as any).compileBoardPages).toHaveBeenCalledWith('b');
      expect((provider as any).reloadThreadPage).toHaveBeenCalledWith('b', 1n);
      expect((provider as any).reloadThreadPage).toHaveBeenCalledWith('b', 2n);
    });
  });

  describe('reloadCacheForThread', () => {
    it('should reload thread page and board pages', async () => {
      jest.spyOn(provider as any, 'reloadThreadPage').mockResolvedValue(undefined);
      jest.spyOn(provider as any, 'compileBoardPages').mockResolvedValue(undefined);
      await provider.reloadCacheForThread('b', 123n);
      expect((provider as any).reloadThreadPage).toHaveBeenCalledWith('b', 123n);
      expect((provider as any).compileBoardPages).toHaveBeenCalledWith('b');
    });
  });

  describe('compileBoardPage', () => {
    it('should compile and write board page', async () => {
      const board = { url: 'b', name: 'Board', boardSettings: { enableCaptcha: false } };
      const page = { current: 0, content: [] };
      fileSystem.writeTextFile.mockResolvedValue(undefined);
      await (provider as any).compileBoardPage(board, page);
      expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
        ['b', `kashiwa${Constants.HTML_SUFFIX}`],
        '<html>test</html>'
      );
    });
  });

  describe('compileThreadPage', () => {
    it('should compile and write thread page', async () => {
      const board = { url: 'b', name: 'Board', boardSettings: { enableCaptcha: false } };
      const thread = { num: 123n };
      fileSystem.writeTextFile.mockResolvedValue(undefined);
      await (provider as any).compileThreadPage(board, thread);
      expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
        ['b', Constants.RES_DIR, `123${Constants.HTML_SUFFIX}`],
        '<html>test</html>'
      );
    });
  });

  describe('compileTemplate', () => {
    it('should compile pug template with content', () => {
      const content = { test: 'value' };
      const result = (provider as any).compileTemplate('test.pug', content);
      expect(result).toBe('<html>test</html>');
    });
  });
});
