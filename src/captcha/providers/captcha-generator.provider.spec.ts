import { CaptchaGeneratorProvider } from './captcha-generator.provider';
import { ConfigService } from '@nestjs/config';

jest.mock('svg-captcha', () => ({
  create: jest.fn(() => ({ data: '<svg>test</svg>', text: 'ABC123' }))
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedAnswer')
}));

describe('CaptchaGeneratorProvider', () => {
  let provider: CaptchaGeneratorProvider;
  let config: jest.Mocked<ConfigService>;

  beforeEach(() => {
    config = {
      getOrThrow: jest.fn()
    } as any;
    provider = new CaptchaGeneratorProvider(config);
  });

  describe('generate', () => {
    it('should generate case-sensitive captcha', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'captcha.salt-rounds':
            return 10;
          case 'captcha.size':
            return 4;
          case 'captcha.ignoreChars':
            return '0O1l';
          case 'captcha.noise':
            return 1;
          case 'captcha.color':
            return true;
          case 'captcha.background':
            return '#ffffff';
          default:
            return undefined;
        }
      });

      const result = await provider.generate(true);

      expect(result).toEqual({
        image: '<svg>test</svg>',
        cryptoAnswer: 'hashedAnswer'
      });
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.salt-rounds');
    });

    it('should generate case-insensitive captcha', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'captcha.salt-rounds':
            return 10;
          case 'captcha.size':
            return 4;
          case 'captcha.ignoreChars':
            return '0O1l';
          case 'captcha.noise':
            return 1;
          case 'captcha.color':
            return true;
          case 'captcha.background':
            return '#ffffff';
          default:
            return undefined;
        }
      });

      const result = await provider.generate(false);

      expect(result).toEqual({
        image: '<svg>test</svg>',
        cryptoAnswer: 'hashedAnswer'
      });
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.salt-rounds');
    });

    it('should generate case-insensitive captcha by default', async () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'captcha.salt-rounds':
            return 10;
          case 'captcha.size':
            return 4;
          case 'captcha.ignoreChars':
            return '0O1l';
          case 'captcha.noise':
            return 1;
          case 'captcha.color':
            return true;
          case 'captcha.background':
            return '#ffffff';
          default:
            return undefined;
        }
      });

      const result = await provider.generate();

      expect(result).toEqual({
        image: '<svg>test</svg>',
        cryptoAnswer: 'hashedAnswer'
      });
    });
  });

  describe('create', () => {
    it('should create captcha with correct configuration', () => {
      config.getOrThrow.mockImplementation((key: string) => {
        switch (key) {
          case 'captcha.size':
            return 6;
          case 'captcha.ignoreChars':
            return '0O1l';
          case 'captcha.noise':
            return 2;
          case 'captcha.color':
            return false;
          case 'captcha.background':
            return '#000000';
          default:
            return undefined;
        }
      });

      const result = (provider as any).create();

      expect(result).toEqual({
        data: '<svg>test</svg>',
        text: 'ABC123'
      });
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.size');
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.ignoreChars');
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.noise');
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.color');
      expect(config.getOrThrow).toHaveBeenCalledWith('captcha.background');
    });
  });
});
