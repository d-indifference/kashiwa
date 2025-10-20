import { Test, TestingModule } from '@nestjs/testing';
import { WhoisProvider } from './whois.provider';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PinoLogger } from 'nestjs-pino';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { WhoisDto } from '@whois/dto';

describe('WhoisProvider', () => {
  let service: WhoisProvider;
  let config: jest.Mocked<ConfigService>;
  let http: jest.Mocked<HttpService>;
  let logger: jest.Mocked<PinoLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhoisProvider,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn()
          }
        },
        {
          provide: HttpService,
          useValue: {
            request: jest.fn()
          }
        },
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            debug: jest.fn(),
            error: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get(WhoisProvider);
    config = module.get(ConfigService) as any;
    http = module.get(HttpService) as any;
    logger = module.get(PinoLogger) as any;
  });

  describe('provideCountryInfo', () => {
    const ip = '8.8.8.8';

    it('should skip when whois.disabled', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        if (key === 'whois.enabled') {
          return false;
        }
      });

      const result = await service.provideCountryInfo(ip, true);
      expect(result).toBeNull();
      expect(logger.debug).toHaveBeenCalledWith(
        { enabled: false, allowGeoIp: true },
        'whois is disabled, skipping it...'
      );
    });

    it('should skip when allowGeoIp is false', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        if (key === 'whois.enabled') {
          return true;
        }
      });

      const result = await service.provideCountryInfo(ip, false);
      expect(result).toBeNull();
      expect(logger.debug).toHaveBeenCalledWith(
        { enabled: true, allowGeoIp: false },
        'whois is disabled, skipping it...'
      );
    });

    it('should return WhoisDto on success', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'whois.enabled':
            return true;
          case 'whois.api.address':
            return 'http://ipwho.is/#{ip}';
          case 'whois.api.method':
            return 'GET';
          default:
            return null;
        }
      });

      const response: AxiosResponse = {
        data: { success: true, flag: { img: 'flag.png' }, country: 'USA' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };

      http.request.mockReturnValue(of(response));

      const result = await service.provideCountryInfo(ip, true);
      expect(result).toEqual(new WhoisDto('flag.png', 'USA'));
      expect(http.request).toHaveBeenCalledWith({
        url: 'http://ipwho.is/8.8.8.8',
        method: 'GET'
      });
    });

    it('should return null when API response is unsuccessful', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'whois.enabled':
            return true;
          case 'whois.api.address':
            return 'http://ipwho.is/#{ip}';
          case 'whois.api.method':
            return 'GET';
          default:
            return null;
        }
      });

      const response: AxiosResponse = {
        data: { success: false },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };

      http.request.mockReturnValue(of(response));

      const result = await service.provideCountryInfo(ip, true);
      expect(result).toBeNull();
    });

    it('should handle request error gracefully', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'whois.enabled':
            return true;
          case 'whois.api.address':
            return 'http://ipwho.is/#{ip}';
          case 'whois.api.method':
            return 'GET';
          default:
            return null;
        }
      });

      http.request.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.provideCountryInfo(ip, true);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('precompileApiString', () => {
    it('should correctly substitute ip into string', () => {
      const result = service['precompileApiString']('http://ipwho.is/#{ip}', '1.2.3.4');
      expect(result).toBe('http://ipwho.is/1.2.3.4');
    });
  });

  describe('fetchParams', () => {
    it('should correctly return config values', () => {
      config.getOrThrow.mockImplementation((key: string) => {
        const map = {
          'whois.enabled': true,
          'whois.api.address': 'http://ipwho.is/#{ip}',
          'whois.api.method': 'GET'
        };
        return map[key];
      });

      const params = service['fetchParams']();
      expect(params).toEqual({
        enabled: true,
        apiAddress: 'http://ipwho.is/#{ip}',
        apiMethod: 'GET'
      });
    });
  });
});
