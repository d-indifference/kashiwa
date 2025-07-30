import { ParseBigintPipe } from './parse-bigint.pipe';
import { BadRequestException } from '@nestjs/common';

// Мок LOCALE
const LOCALE = {
  BIGINT_VALIDATION_FAILED: 'Bigint validation failed'
};

describe('ParseBigintPipe', () => {
  let pipe: ParseBigintPipe;

  beforeEach(() => {
    pipe = new ParseBigintPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform valid integer string to bigint', () => {
    expect(pipe.transform('123')).toBe(BigInt(123));
    expect(pipe.transform('-456')).toBe(BigInt(-456));
    expect(pipe.transform('0')).toBe(BigInt(0));
  });

  it('should throw BadRequestException for non-integer string', () => {
    const invalidValues = ['12.3', 'abc', '', ' ', '1e10', '0x123', '123abc', '--123', '123.0', '+123'];
    for (const val of invalidValues) {
      // eslint-disable-next-line no-loop-func
      expect(() => pipe.transform(val)).toThrow(BadRequestException);
    }
  });

  it('should throw BadRequestException for values causing BigInt error', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });
});
