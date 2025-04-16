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
 * Truncates text on board preview
 * @param text Comment text
 * @param url Board URL
 * @param openingPost Opening post num
 * @param num Truncated post number
 */
export const truncateText = (text: string, url: string, openingPost: bigint, num: bigint): string => {
  const truncatedParagraphs = 4;
  const truncatedLines = 15;

  const paragraphRegex = /<p>(.*?)<\/p>/g;
  const paragraphs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = paragraphRegex.exec(text)) !== null) {
    paragraphs.push(match[1]);
  }

  const firstNParagraphs = paragraphs.slice(0, truncatedParagraphs);
  const allLessThanNLines = firstNParagraphs.every(paragraph => {
    const lines = paragraph.split('<br>').length;
    return lines < truncatedLines;
  });

  if (allLessThanNLines && firstNParagraphs.length === truncatedParagraphs) {
    return `${firstNParagraphs.map(p => `<p>${p}</p>`).join('')}<div class="abbrev">Comment is too long. <a href="/${url}/${Constants.RES_DIR}/${openingPost.toString()}${Constants.HTML_SUFFIX}#${num}">Full text</a>.</div>`;
  }

  for (const paragraph of paragraphs) {
    const lines = paragraph.split('<br>');
    if (lines.length >= 15) {
      const truncatedParagraph = `${lines.slice(0, truncatedLines).join('<br>')}<div class="abbrev">Comment is too long. <a href="/${url}/${Constants.RES_DIR}/${openingPost.toString()}${Constants.HTML_SUFFIX}#${num}">Full text</a>.</div>`;
      return `<p>${truncatedParagraph}</p>`;
    }
  }

  return text;
};
