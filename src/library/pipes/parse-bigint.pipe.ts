import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { LOCALE } from '@locale/locale';

/**
 * Pipe to convert a string value to a bigint with validation.
 *
 * Checks that the input value is a valid integer string.
 * Throws `BadRequestException` with a localized message on error.
 */
@Injectable()
export class ParseBigintPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    try {
      if (!/^-?\d+$/.test(value)) {
        throw new BadRequestException(LOCALE.BIGINT_VALIDATION_FAILED as string);
      }

      return BigInt(value);
    } catch {
      throw new BadRequestException(LOCALE.BIGINT_VALIDATION_FAILED as string);
    }
  }
}
