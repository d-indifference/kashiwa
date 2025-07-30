import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  ValidationOptions,
  IsIP,
  IsNumberOptions,
  IsNumber,
  IsEnum,
  Matches,
  IsBoolean,
  IsIn,
  IsPositive,
  Min,
  Max,
  IsArray,
  IsUUID,
  IsNumberString,
  MinLength,
  registerDecorator,
  ValidationArguments
} from 'class-validator';
import { LOCALE, V_LOCALE, vStr } from '@locale/locale';
import * as ValidatorJS from 'validator';
import { IsIpVersion } from 'class-validator/types/decorator/string/IsIP';
import { IsFile, MaxFileSize } from 'nestjs-form-data';

// NB: For future contributors:
// It is strongly recommended to use only the decorators from this set for form field validation, and add and localize decorators from 'class-validator' here if needed.

/**
 * Localized wrapper for `@IsString` decorator from `'class-validator'` package
 */
export const KIsString = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsString({ message: V_LOCALE['V_STRING'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsNotEmpty` decorator from `'class-validator'` package
 */
export const KIsNotEmpty = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsNotEmpty({ message: V_LOCALE['V_NOT_EMPTY'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@Length` decorator from `'class-validator'` package
 */
export const KLength =
  (field: string, min: number, max: number, options?: ValidationOptions) => (obj: object, prop: string) => {
    Length(min, max, { message: V_LOCALE['V_LENGTH'](vStr(LOCALE[field]), min, max), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@IsEmail` decorator from `'class-validator'` package
 */
export const KIsEmail =
  (field: string, emailOptions?: ValidatorJS.IsEmailOptions, options?: ValidationOptions) =>
  (obj: object, prop: string) => {
    IsEmail(emailOptions, { message: V_LOCALE['V_EMAIL'](vStr(LOCALE[field])), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@IsIP` decorator from `'class-validator'` package
 */
export const KIsIp =
  (field: string, ipOptions?: IsIpVersion, options?: ValidationOptions) => (obj: object, prop: string) => {
    IsIP(ipOptions, { message: V_LOCALE['V_IP'](vStr(LOCALE[field])), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@IsNumber` decorator from `'class-validator'` package
 */
export const KIsNumber =
  (field: string, numOptions?: IsNumberOptions, options?: ValidationOptions) => (obj: object, prop: string) => {
    IsNumber(numOptions, { message: V_LOCALE['V_NUMBER'](vStr(LOCALE[field])), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@IsEnum` decorator from `'class-validator'` package
 */
export const KISEnum = (field: string, entity: object, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsEnum(entity, { message: V_LOCALE['V_ENUM'](vStr(LOCALE[field]), entity), ...options })(obj, prop);
};

/**
 * Localized & customized wrapper for `@Matches` decorator from `'class-validator'` package for validating of board URL
 */
export const KCustomBoardMatches = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  Matches(/^[a-z]+$/, { message: V_LOCALE['V_BOARD_MATCHES'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsBoolean` decorator from `'class-validator'` package
 */
export const KIsBoolean = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsBoolean({ message: V_LOCALE['V_BOOLEAN'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsIn` decorator from `'class-validator'` package
 */
export const KIsIn =
  (field: string, vals: readonly unknown[], options?: ValidationOptions) => (obj: object, prop: string) => {
    IsIn(vals, { message: V_LOCALE['V_IN'](vStr(LOCALE[field]), vals), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@IsPositive` decorator from `'class-validator'` package
 */
export const KIsPositive = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsPositive({ message: V_LOCALE['V_POSITIVE'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@Min` decorator from `'class-validator'` package
 */
export const KMin = (field: string, val: number, options?: ValidationOptions) => (obj: object, prop: string) => {
  Min(val, { message: V_LOCALE['V_MIN'](vStr(LOCALE[field]), vStr(val)), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@Max` decorator from `'class-validator'` package
 */
export const KMax = (field: string, val: number, options?: ValidationOptions) => (obj: object, prop: string) => {
  Max(val, { message: V_LOCALE['V_MAX'](vStr(LOCALE[field]), vStr(val)), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsArray` decorator from `'class-validator'` package
 */
export const KIsArray = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsArray({ message: V_LOCALE['V_ARRAY'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsUUID` decorator from `'class-validator'` package
 */
export const KIsUUIDv4 = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsUUID('4', { message: V_LOCALE['V_UUIDV4'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsNumberString` decorator from `'class-validator'` package
 */
export const KIsNumberString =
  (field: string, numStrOpts?: ValidatorJS.IsNumericOptions, options?: ValidationOptions) =>
  (obj: object, prop: string) => {
    IsNumberString(numStrOpts, { message: V_LOCALE['V_NUMBER_STRING'](vStr(field)), ...options })(obj, prop);
  };

/**
 * Localized wrapper for `@MinLength` decorator from `'class-validator'` package
 */
export const KMinLength = (field: string, val: number, options?: ValidationOptions) => (obj: object, prop: string) => {
  MinLength(val, { message: V_LOCALE['V_MIN_LENGTH'](vStr(LOCALE[field]), vStr(val)), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@IsFile` decorator from `'nestjs-form-data'` package
 */
export const KIsFile = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsFile({ message: V_LOCALE['V_FILE'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Localized wrapper for `@MaxFileSize` decorator from `'nestjs-form-data'` package
 */
export const KMaxFileSize =
  (field: string, size: number, options?: ValidationOptions) => (obj: object, prop: string) => {
    MaxFileSize(size, { message: V_LOCALE['V_MAX_FILE_SIZE'](vStr(LOCALE[field]), size), ...options })(obj, prop);
  };

/**
 * Localized wrapper for custom `@IsBigInt`
 */
export const KIsBigint = (field: string, options?: ValidationOptions) => (obj: object, prop: string) => {
  IsBigInt({ message: V_LOCALE['V_BIGINT'](vStr(LOCALE[field])), ...options })(obj, prop);
};

/**
 * Validate `bigint` type field with `class-validator`
 */
export const IsBigInt = (validationOptions?: ValidationOptions) => {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBigInt',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (Array.isArray(value)) {
            return value.every(isValidBigInt);
          }
          return isValidBigInt(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a bigint or a string representing a bigint`;
        }
      }
    });
  };
};

const isValidBigInt = (value: unknown): boolean => {
  try {
    if (typeof value === 'bigint') {
      return true;
    }
    if (typeof value === 'string' && /^-?\d+$/.test(value)) {
      BigInt(value);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
