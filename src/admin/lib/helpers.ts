import { Constants } from '@library/constants';

export const getSupportedFileTypes = (): string[][] =>
  Constants.SUPPORTED_FILE_TYPES.map(fileType => [fileType, fileType.split('/')[1].toUpperCase()]);
