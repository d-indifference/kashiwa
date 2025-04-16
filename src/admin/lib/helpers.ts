import { Constants } from '@library/constants';

/**
 * Returns supported file types to Pug template
 */
export const getSupportedFileTypes = (): string[][] =>
  Constants.SUPPORTED_FILE_TYPES.map(fileType => [fileType, fileType.split('/')[1].toUpperCase()]);
