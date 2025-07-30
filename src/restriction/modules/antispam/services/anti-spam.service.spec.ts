import { AntiSpamService } from './anti-spam.service';
import { BadRequestException } from '@nestjs/common';

describe('AntiSpamService', () => {
  let siteContextMock: any;
  let service: AntiSpamService;

  // Мок для LOCALE
  const LOCALE = {
    INPUT_CONTAINS_SPAM: (pattern: string) => `Spam detected: ${pattern}`
  };

  beforeAll(() => {
    (global as any).LOCALE = LOCALE;
  });

  beforeEach(() => {
    siteContextMock = {
      getSpamExpressions: jest.fn()
    };
    service = new AntiSpamService(siteContextMock);
  });

  describe('compileSpamRegexes', () => {
    it('should compile regexes from site context', () => {
      siteContextMock.getSpamExpressions.mockReturnValue(['spamword', 'bad\\d+']);
      service.compileSpamRegexes();
      expect(service['compiledSpamRegexes']).toHaveLength(2);
      expect(service['compiledSpamRegexes'][0]).toBeInstanceOf(RegExp);
    });

    it('should handle empty spam expressions', () => {
      siteContextMock.getSpamExpressions.mockReturnValue([]);
      service.compileSpamRegexes();
      expect(service['compiledSpamRegexes']).toHaveLength(0);
    });
  });

  describe('checkSpam', () => {
    beforeEach(() => {
      siteContextMock.getSpamExpressions.mockReturnValue(['spamword', 'bad\\d+']);
      service.compileSpamRegexes();
    });

    it('should not throw if isAdmin is true', () => {
      const form = {
        name: 'normaluser',
        email: 'normal@site.com',
        subject: 'Hello',
        comment: 'All good'
      };
      expect(() => service.checkSpam(form, true)).not.toThrow();
    });

    it('should not throw if no fields match spam', () => {
      const form = {
        name: 'safe',
        email: 'safe@site.com',
        subject: 'Normal',
        comment: 'Everything clean'
      };
      expect(() => service.checkSpam(form, false)).not.toThrow();
    });

    it('should throw BadRequestException if any field matches spam regex', () => {
      const form = {
        name: 'user',
        email: 'spammer@site.com',
        subject: 'bad123',
        comment: 'no spam here'
      };
      // subject содержит bad123, подходит под 'bad\\d+'
      expect(() => service.checkSpam(form, false)).toThrow(BadRequestException);
      try {
        service.checkSpam(form, false);
      } catch (e) {
        expect(e.message).toBe('Your input contains spam: bad\\d+');
      }
    });

    it('should throw with correct message for matching spamword', () => {
      const form = {
        name: 'spamword',
        email: 'test@site.com',
        subject: 'Ok',
        comment: 'Fine'
      };
      expect(() => service.checkSpam(form, false)).toThrow(BadRequestException);
      try {
        service.checkSpam(form, false);
      } catch (e) {
        expect(e.message).toBe('Your input contains spam: spamword');
      }
    });

    it('should check all fields for spam', () => {
      const form = {
        name: 'user',
        email: 'normal@site.com',
        subject: 'Normal',
        comment: 'bad999'
      };
      expect(() => service.checkSpam(form, false)).toThrow(BadRequestException);
      try {
        service.checkSpam(form, false);
      } catch (e) {
        expect(e.message).toBe('Your input contains spam: bad\\d+');
      }
    });

    it('should skip empty fields', () => {
      const form = {
        name: '',
        email: '',
        subject: '',
        comment: 'Safe comment'
      };
      expect(() => service.checkSpam(form, false)).not.toThrow();
    });
  });
});
