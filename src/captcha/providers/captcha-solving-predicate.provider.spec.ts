import { CaptchaSolvingPredicateProvider } from './captcha-solving-predicate.provider';
import * as bcrypt from 'bcrypt';

describe('CaptchaSolvingPredicateProvider', () => {
  let provider: CaptchaSolvingPredicateProvider;

  beforeEach(() => {
    provider = new CaptchaSolvingPredicateProvider();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return true for admin', async () => {
    const result = await provider.isCaptchaSolved(true, 'anyRightAnswer', 'anyUserAnswer');
    expect(result).toBe(true);
  });

  it('should return false if rightAnswer is missing for non-admin', async () => {
    const result = await provider.isCaptchaSolved(false, undefined, 'userAnswer');
    expect(result).toBe(false);
  });

  it('should return false if userAnswer is missing for non-admin', async () => {
    const result = await provider.isCaptchaSolved(false, 'rightAnswer', undefined);
    expect(result).toBe(false);
  });

  it('should use bcrypt.compare for non-admin', async () => {
    const compareMock = jest
      .spyOn(bcrypt, 'compare')
      // eslint-disable-next-line
      .mockImplementation(async (_data: string | Buffer, _encrypted: string): Promise<boolean> => true);

    const result = await provider.isCaptchaSolved(false, 'encryptedRightAnswer', 'userAnswer');
    expect(compareMock).toHaveBeenCalledWith('userAnswer', 'encryptedRightAnswer');
    expect(result).toBe(true);

    compareMock.mockRestore();
  });
});
