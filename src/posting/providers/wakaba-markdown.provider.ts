import { Comment } from '@prisma/client';
import { CommentPersistenceService } from '@persistence/services';
import { Injectable } from '@nestjs/common';
import { escapeHtml } from '@posting/lib/functions';

/**
 * Service for processing of Wakaba markdown
 */
@Injectable()
export class WakabaMarkdownProvider {
  constructor(private readonly commentPersistenceService: CommentPersistenceService) {}

  /**
   * Apply wakaba markdown to comment text
   * @param input Comment text
   * @param boardUrl Board URL
   * @param isMarkdownEnabled Flag from board settings. If it is `false`, only replies, citations and links markdown allowed
   */
  public async formatAsWakaba(
    input: string,
    boardUrl: string,
    isMarkdownEnabled: boolean,
    isAdmin: boolean
  ): Promise<string> {
    let output = isAdmin ? input : escapeHtml(input);

    output = await this.parseCommentLinks(output, boardUrl);
    output = parseQuotes(output);

    if (isMarkdownEnabled) {
      output = parseSpoilers(output);
      output = parseCode(output);
      output = parseStrikethrough(output);
      output = parseBold(output);
      output = parseItalic(output);
    }

    output = parseLinks(output);
    output = parseLineBreaksAndParagraphs(output);

    return output;
  }

  private async parseCommentLinks(text: string, boardUrl: string): Promise<string> {
    const commentLinkRegex = /&gt;&gt;(\d+)/g;
    const promises: Promise<string>[] = [];
    let match: RegExpExecArray | null;

    while ((match = commentLinkRegex.exec(text)) !== null) {
      const num = BigInt(match[1]);
      promises.push(
        this.commentPersistenceService
          .findCommentForFormatting(boardUrl, num)
          .then((comment: Comment | null): string => {
            if (comment) {
              if (comment.parentId) {
                return `<a href="/${boardUrl}/res/${comment['parent'].num}.html#${num}">>>${num}</a>`;
              }
              return `<a href="/${boardUrl}/res/${num}.html#${num}">>>${num}</a>`;
            }
            return `>>${num}`;
          })
      );
    }

    const replacements = await Promise.all(promises);
    let i = 0;
    return text.replace(commentLinkRegex, () => replacements[i++]);
  }
}

const parseQuotes = (text: string): string => {
  return text.replace(/^(&gt;.*)$/gm, '<span class="unkfunc">$1</span>');
};

const parseSpoilers = (text: string): string => {
  return text.replace(/\[spoiler\](.*?)\[&#x2F;spoiler\]/g, '<span class="spoiler">$1</span>');
};

const parseCode = (text: string): string => {
  return text.replace(/\[code\](.*?)\[&#x2F;code\]/g, '<pre><code>$1</code></pre>');
};

const parseStrikethrough = (text: string): string => {
  return text.replace(/\[s\](.*?)\[&#x2F;s\]/g, '<s>$1</s>');
};

const parseBold = (text: string): string => {
  return text.replace(/\[b\](.*?)\[&#x2F;b\]/g, '<b>$1</b>');
};

const parseItalic = (text: string): string => {
  return text.replace(/\[i\](.*?)\[&#x2F;i\]/g, '<i>$1</i>');
};

const parseLinks = (text: string): string => {
  const linkRegex = /(\b(https?|ftp|irc):&#x2F;&#x2F;[-A-Z0-9+&@#&#x2F;%?=~_|!:,.;]*[-A-Z0-9+&@#&#x2F;%=~_|])/gi;
  return text.replace(linkRegex, '<a href="$1" rel="noreferrer">$1</a>');
};

const parseLineBreaksAndParagraphs = (text: string): string => {
  const paragraphs = text.split('\r\n\r\n');

  if (paragraphs.length === 1) {
    const content = paragraphs[0].replace(/\r\n/g, '<br>').trim();
    return content ? `<p>${content}</p>` : '';
  }

  const parsedParagraphs = paragraphs
    .map(paragraph => {
      if (!paragraph.trim()) {
        return '';
      }
      const content = paragraph.replace(/\r\n/g, '<br>').trim();
      return `<p>${content}</p>`;
    })
    .filter(p => p);

  return parsedParagraphs.join('');
};
