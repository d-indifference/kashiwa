import { TransformFnParams } from 'class-transformer';

/**
 * Transform function for empty form fields (converts them to `undefined`)
 */
export const emptyFormText = (params: TransformFnParams) => params.value ?? undefined;

export const normalizeBooleanCheckbox = (params: TransformFnParams) => params.value === 'true' || params.value === 'on';

export const normalizeNumber = (params: TransformFnParams) => Number(params.value);

export const normalizeStringArray = (params: TransformFnParams): string[] =>
  Array.isArray(params.value) ? params.value : [params.value];
