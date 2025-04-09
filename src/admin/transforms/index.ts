import { TransformFnParams } from 'class-transformer';

/**
 * Transform function for empty form fields (converts them to `undefined`)
 */
export const emptyFormText = (params: TransformFnParams) => params.value ?? undefined;

/**
 * Transform function for HTML checkbox to boolean value
 */
export const normalizeBooleanCheckbox = (params: TransformFnParams) => params.value === 'true' || params.value === 'on';

/**
 * Transform function for HTML `<input type="number">` value to `number` value
 */
export const normalizeNumber = (params: TransformFnParams) => Number(params.value);

/**
 * Transform function for HTML checkbox group or string values
 */
export const normalizeStringArray = (params: TransformFnParams): string[] =>
  Array.isArray(params.value) ? params.value : [params.value];
