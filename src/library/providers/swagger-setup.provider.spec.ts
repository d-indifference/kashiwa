/* eslint-disable @typescript-eslint/ban-ts-comment */

import { SwaggerSetupProvider } from './swagger-setup.provider';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiModule } from '@api/api.module';

jest.mock('@nestjs/swagger', () => ({
  ...jest.requireActual('@nestjs/swagger'),
  SwaggerModule: {
    createDocument: jest.fn()
  },
  DocumentBuilder: jest.requireActual('@nestjs/swagger').DocumentBuilder
}));

describe('SwaggerSetupProvider', () => {
  let provider: SwaggerSetupProvider;
  let configMock: jest.Mocked<ConfigService>;
  let appMock: NestExpressApplication;

  beforeEach(() => {
    configMock = {
      getOrThrow: jest.fn()
    } as any;
    provider = new SwaggerSetupProvider(configMock);
    appMock = {} as NestExpressApplication;
    jest.clearAllMocks();
    process.env.npm_package_version = '1.2.3';
  });

  describe('setupDocs', () => {
    it('should build swagger config and call SwaggerModule.createDocument', () => {
      configMock.getOrThrow.mockImplementation((key: string) => {
        if (key === 'application.name') {
          return 'TestApp';
        }
        if (key === 'application.description') {
          return 'Test Description';
        }
        throw new Error('Unknown key');
      });

      // Ожидаемый результат buildConfig
      const expectedConfig = new DocumentBuilder()
        .setTitle('TestApp')
        .setDescription('Test Description')
        .setVersion('1.2.3')
        .setLicense('GPLv2', 'https://github.com/d-indifference/kashiwa/blob/main/LICENSE')
        .build();

      (SwaggerModule.createDocument as jest.Mock).mockReturnValue({ openapi: '3.0.0' });

      const result = provider.setupDocs(appMock);

      expect(SwaggerModule.createDocument).toHaveBeenCalledWith(appMock, expectedConfig, { include: [ApiModule] });
      expect(result).toEqual({ openapi: '3.0.0' });
    });
  });

  describe('buildConfig', () => {
    it('should build swagger config with title, description, version, and license', () => {
      configMock.getOrThrow.mockImplementation((key: string) => {
        if (key === 'application.name') {
          return 'SampleApp';
        }
        if (key === 'application.description') {
          return 'Sample Description';
        }
        throw new Error('Unknown key');
      });
      process.env.npm_package_version = '9.9.9';

      // @ts-ignore
      const result = provider.buildConfig();

      expect(result.info.title).toBe('SampleApp');
      expect(result.info.description).toBe('Sample Description');
      expect(result.info.version).toBe('9.9.9');
      expect(result.info.license).toEqual({
        name: 'GPLv2',
        url: 'https://github.com/d-indifference/kashiwa/blob/main/LICENSE'
      });
    });
  });
});
