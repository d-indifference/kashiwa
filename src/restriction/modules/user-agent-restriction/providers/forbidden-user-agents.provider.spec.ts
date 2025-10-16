import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenUserAgentsProvider } from '@restriction/modules/user-agent-restriction/providers';
import { SiteContextProvider } from '@library/providers';
import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';

describe('ForbiddenUserAgentsProvider', () => {
  let provider: ForbiddenUserAgentsProvider;
  let siteContext: jest.Mocked<SiteContextProvider>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    siteContext = {
      getForbiddenUserAgents: jest.fn()
    } as any;

    logger = {
      setContext: jest.fn(),
      debug: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForbiddenUserAgentsProvider,
        { provide: SiteContextProvider, useValue: siteContext },
        { provide: PinoLogger, useValue: logger }
      ]
    }).compile();

    provider = module.get<ForbiddenUserAgentsProvider>(ForbiddenUserAgentsProvider);
  });

  afterEach(() => jest.clearAllMocks());

  describe('checkUserAgent', () => {
    it('should always return true for admin requests', () => {
      const req = { get: jest.fn().mockReturnValue('Mozilla/5.0') } as unknown as Request;

      const result = provider.checkUserAgent(req, true);

      expect(result).toBe(true);
      expect(logger.debug).toHaveBeenCalledWith({ userAgent: 'Mozilla/5.0', isAdmin: true }, 'checkUserAgent');
      expect(siteContext.getForbiddenUserAgents).not.toHaveBeenCalled();
    });

    it('should return true if there are no forbidden user agents configured', () => {
      const req = { get: jest.fn().mockReturnValue('Mozilla/5.0') } as unknown as Request;
      siteContext.getForbiddenUserAgents.mockReturnValue(undefined);

      const result = provider.checkUserAgent(req, false);

      expect(result).toBe(true);
      expect(siteContext.getForbiddenUserAgents).toHaveBeenCalled();
    });

    it('should return true when user-agent does not match any forbidden patterns', () => {
      const req = { get: jest.fn().mockReturnValue('Mozilla/5.0 Chrome/123') } as unknown as Request;
      siteContext.getForbiddenUserAgents.mockReturnValue([/curl/i, /bot/i]);

      const result = provider.checkUserAgent(req, false);

      expect(result).toBe(true);
    });

    it('should return false when user-agent matches at least one forbidden pattern', () => {
      const req = { get: jest.fn().mockReturnValue('curl/8.1.0') } as unknown as Request;
      siteContext.getForbiddenUserAgents.mockReturnValue([/curl/i, /bot/i]);

      const result = provider.checkUserAgent(req, false);

      expect(result).toBe(false);
    });

    it('should handle missing user-agent header gracefully', () => {
      const req = { get: jest.fn().mockReturnValue(undefined) } as unknown as Request;
      siteContext.getForbiddenUserAgents.mockReturnValue([]);

      const result = provider.checkUserAgent(req, false);

      expect(result).toBe(true);
      expect(logger.debug).toHaveBeenCalledWith({ userAgent: '', isAdmin: false }, 'checkUserAgent');
    });
  });
});
