import { TransformFnParams } from 'class-transformer';

/**
 * Transform number to positive (>= 0) integer
 */
export const normalizePositiveInteger = (params: TransformFnParams): number => {
  if (params.value) {
    const rounded = Math.ceil(params.value as number);

    if (rounded >= 0) {
      return rounded;
    }

    return 0;
  }

  return params.value;
};
