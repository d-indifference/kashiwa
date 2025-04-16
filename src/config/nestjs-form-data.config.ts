import { FormDataInterceptorConfig, MemoryStoredFile } from 'nestjs-form-data';

/**
 * Configuration for `nestjs-form-data` module
 */
export const nestjsFormDataConfig: FormDataInterceptorConfig = {
  storage: MemoryStoredFile,
  cleanupAfterSuccessHandle: true,
  cleanupAfterFailedHandle: true
};
