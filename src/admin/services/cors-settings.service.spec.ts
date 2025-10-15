import { CorsSettingsService } from './cors-settings.service';
import { FileSystemProvider, SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { ISession } from '@admin/interfaces';
import { CorsSettingsForm } from '@admin/forms/cors-settings.form';
import { Response } from 'express';
import { Constants } from '@library/constants';

const HTML_FORM_RESULT = `<form method="post" action="/kashiwa/cors-settings"><table><tbody><tr>
    <td class="postblock">CORS Allowed origins</td>
    <td><textarea name="allowedOrigins" rows="25" cols="60">`;

describe('CorsSettingsService', () => {
  let service: CorsSettingsService;
  let fileSystem: jest.Mocked<FileSystemProvider>;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(() => {
    fileSystem = {
      writeTextFile: jest.fn()
    } as any;

    siteContext = {
      getCorsAllowedOrigins: jest.fn(),
      setCorsAllowedOrigins: jest.fn()
    } as any;

    logger = {
      setContext: jest.fn(),
      debug: jest.fn(),
      info: jest.fn()
    } as any;

    service = new CorsSettingsService(fileSystem, siteContext, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renderFormContent', () => {
    it('should render form content with allowed origins from siteContext', () => {
      const session = {} as ISession;
      siteContext.getCorsAllowedOrigins.mockReturnValue(['https://foo.com', 'https://bar.com']);

      const result = service.renderFormContent(session);

      expect(siteContext.getCorsAllowedOrigins).toHaveBeenCalled();
      expect(result.form.startsWith(HTML_FORM_RESULT)).toBeTruthy();
      expect(logger.debug).toHaveBeenCalledWith({ session }, 'renderFormContent');
    });

    it('should handle empty allowed origins', () => {
      const session = {} as ISession;
      siteContext.getCorsAllowedOrigins.mockReturnValue([]);

      const result = service.renderFormContent(session);

      expect(result.form.startsWith(HTML_FORM_RESULT)).toBeTruthy();
    });
  });

  describe('saveCorsSettings', () => {
    it('should save allowed origins and write to file, then redirect', async () => {
      const form = new CorsSettingsForm();
      form.allowedOrigins = 'https://foo.com\r\nhttps://bar.com';

      const res = {
        redirect: jest.fn()
      } as unknown as Response;

      await service.saveCorsSettings(form, res);

      expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith(['https://foo.com', 'https://bar.com']);
      expect(fileSystem.writeTextFile).toHaveBeenCalledWith(
        [Constants.SETTINGS_DIR, Constants.FILE_ALLOWED_ORIGINS],
        'https://foo.com\r\nhttps://bar.com'
      );
      expect(res.redirect).toHaveBeenCalledWith('/kashiwa/cors-settings');
      expect(logger.info).toHaveBeenCalledWith({ form }, 'saveIpFilter');
    });

    it('should handle empty lines in allowed origins', async () => {
      const form = new CorsSettingsForm();
      form.allowedOrigins = 'https://foo.com\r\n\r\nhttps://bar.com\r\n';

      const res = { redirect: jest.fn() } as unknown as Response;

      await service.saveCorsSettings(form, res);

      expect(siteContext.setCorsAllowedOrigins).toHaveBeenCalledWith(['https://foo.com', 'https://bar.com']);
    });
  });
});
