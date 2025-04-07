import { filesize } from 'filesize';
import { DateTime } from 'luxon';
import { Constants } from '@library/constants';
import * as process from 'node:process';

/**
 * Converts number of bytes to pretty string format on Pug thread template
 * @param size File size (bytes)
 */
export const fileSize = (size: number): string => filesize(size, { standard: Constants.FILE_SIZE_FORMAT });

/**
 * Converts JS-date to default datetime format of application on Pug thread template
 * @param dateTime JS `Date` object
 */
export const formatDateTime = (dateTime: Date) => DateTime.fromJSDate(dateTime).toFormat(Constants.DATE_DISPLAY_FORMAT);

/**
 * Get NPM project version to Pug thread template
 */
export const applicationVersion = () => process.env.npm_package_version;

/**
 * Get filename page stub for non-images
 * @param mime File MIME-type
 */
export const compileFileStub = (mime: string) => `${mime.replace('/', '-')}.png`;
