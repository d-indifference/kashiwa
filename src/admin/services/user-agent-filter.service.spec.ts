import { Test, TestingModule } from '@nestjs/testing';
import { UserAgentFilterService } from '@admin/services/user-agent-filter.service';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { UserAgentForm } from '@admin/forms';
import { Constants } from '@library/constants';
import { Response } from 'express';

describe('UserAgentFilterService', () => {
  let service: UserAgentFilterService;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    fileSystem = { writeTextFile: jest.fn() } as any;
    siteContext = {
      getForbiddenUserAgents: jest.fn(),
      setForbiddenUserAgents: jest.fn()
    } as any;
    logger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      info: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAgentFilterService,
        { provide: FileSystemProvider, useValue: fileSystem },
        { provide: SiteContextProvider, useValue: siteContext },
        { provide: PinoLogger, useValue: logger }
      ]
    }).compile();

    service = module.get<UserAgentFilterService>(UserAgentFilterService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('renderFormContent', () => {
    it('should return a RenderableSessionFormPage object with valid form data', () => {
      const mockSession = { id: 123 } as any;
      siteContext.getForbiddenUserAgents.mockReturnValue([/bot/i, /curl/i]);

      const result = service.renderFormContent(mockSession);

      expect(logger.debug).toHaveBeenCalledWith({ session: mockSession }, 'renderFormContent');
      expect(result).toBeDefined();
      expect(result.form).toContain('bot');
      expect(result.form).toContain('curl');
    });
  });

  describe('saveUserAgentList', () => {
    it('should save the list and update the siteContext', async () => {
      const form: UserAgentForm = { forbiddenUserAgents: 'bot\r\ncurl\r\n' } as any;
      const mockRes = { redirect: jest.fn() } as unknown as Response;

      await service.saveUserAgentList(form, mockRes);

      expect(logger.info).toHaveBeenCalledWith({ form }, 'saveUserAgentList');
      expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
        [Constants.SETTINGS_DIR, Constants.FILE_FORBIDDEN_USER_AGENTS],
        form.forbiddenUserAgents
      );

      expect(siteContext.setForbiddenUserAgents).toHaveBeenCalledWith([/bot/i, /curl/i]);
      expect(mockRes.redirect).toHaveBeenCalledWith('/kashiwa/user-agents');
    });

    it('should ignore empty lines when compiling regex', async () => {
      const form: UserAgentForm = { forbiddenUserAgents: 'bot\r\n\r\ncurl' } as any;
      const mockRes = { redirect: jest.fn() } as unknown as Response;

      await service.saveUserAgentList(form, mockRes);

      const [arg] = siteContext.setForbiddenUserAgents.mock.calls[0];
      expect(arg).toHaveLength(2); // только 2 валидных regex
    });
  });
});
