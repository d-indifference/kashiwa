import { TransformFnParams } from 'class-transformer';

/**
 * Transform function for empty form fields (converts them to `undefined`)
 */
export const emptyFormText = (params: TransformFnParams) => params.value ?? undefined;
