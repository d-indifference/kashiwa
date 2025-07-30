import { WakabaMarkdownProvider } from './wakaba-markdown.provider';
import { escapeHtml } from '@posting/lib/functions';

jest.mock('@posting/lib/functions', () => ({
  escapeHtml: jest.fn((s: string) => s.replaceAll('/', '&#x2F;'))
}));

describe('WakabaMarkdownProvider', () => {
  let provider: WakabaMarkdownProvider;
  let commentPersistenceServiceMock: any;

  beforeEach(() => {
    commentPersistenceServiceMock = {
      findCommentForFormatting: jest.fn()
    };

    provider = new WakabaMarkdownProvider(commentPersistenceServiceMock);
    jest.clearAllMocks();
  });

  describe('formatAsWakaba', () => {
    it('should escape html if not admin', async () => {
      const input = '[b]text[/b]';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(escapeHtml).toHaveBeenCalledWith(input);
      expect(result).toContain('<b>text</b>');
    });

    it('should not escape html if admin', async () => {
      const input = '[b]text[/b]';
      const result = await provider.formatAsWakaba(input, 'b', true, true);
      expect(escapeHtml).not.toHaveBeenCalled();
      expect(result).toContain('[b]text[/b]');
    });

    it('should handle markdown features when isMarkdownEnabled', async () => {
      const input =
        '[spoiler]abc[&#x2F;spoiler]\r\n[code]code[&#x2F;code]\r\n[s]strike[&#x2F;s]\r\n[b]bold[&#x2F;b]\r\n[i]italic[&#x2F;i]';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('<span class="spoiler">abc</span>');
      expect(result).toContain('<pre><code>code</code></pre>');
      expect(result).toContain('<s>strike</s>');
      expect(result).toContain('<b>bold</b>');
      expect(result).toContain('<i>italic</i>');
    });

    it('should not handle markdown features when isMarkdownEnabled is false', async () => {
      const input =
        '[spoiler]abc[&#x2F;spoiler]\r\n[code]code[&#x2F;code]\r\n[s]strike[&#x2F;s]\r\n[b]bold[&#x2F;b]\r\n[i]italic[&#x2F;i]';
      const result = await provider.formatAsWakaba(input, 'b', false, false);
      expect(result).not.toContain('<span class="spoiler">abc</span>');
      expect(result).not.toContain('<pre><code>code</code></pre>');
      expect(result).not.toContain('<s>strike</s>');
      expect(result).not.toContain('<b>bold</b>');
      expect(result).not.toContain('<i>italic</i>');
    });

    it('should parse links', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const escapeHtmlModule = require('@posting/lib/functions');
      escapeHtmlModule.escapeHtml.mockImplementation((s: string) => s.replaceAll(/\//g, '&#x2F;'));

      const input = 'https://example.com';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain(
        '<a href="https:&#x2F;&#x2F;example.com" rel="noreferrer">https:&#x2F;&#x2F;example.com</a>'
      );

      escapeHtmlModule.escapeHtml.mockRestore();
    });

    it('should parse quotes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const escapeHtmlModule = require('@posting/lib/functions');
      escapeHtmlModule.escapeHtml.mockImplementation((s: string) => s.replaceAll(/>/g, '&gt;'));
      const input = '>quoted text';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('<span class="unkfunc">&gt;quoted text</span>');
    });

    it('should parse line breaks and paragraphs (single paragraph)', async () => {
      const input = 'line1\r\nline2';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('<p>line1<br>line2</p>');
    });

    it('should parse multiple paragraphs', async () => {
      const input = 'para1\r\n\r\npara2';
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('<p>para1</p><p>para2</p>');
    });

    it('should parseCommentLinks with parent and without parent', async () => {
      const input = '>>123 >>456';

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const escapeHtmlModule = require('@posting/lib/functions');
      escapeHtmlModule.escapeHtml.mockImplementation((s: string) => s.replaceAll(/>/g, '&gt;'));

      commentPersistenceServiceMock.findCommentForFormatting
        .mockResolvedValueOnce({ parentId: 1, parent: { num: 999 } })
        .mockResolvedValueOnce({ parentId: null });
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('<a href="/b/res/999.html#123">>>123</a>');
      expect(result).toContain('<a href="/b/res/456.html#456">>>456</a>');
    });

    it('should leave >>num as is if comment not found', async () => {
      const input = '>>789';
      commentPersistenceServiceMock.findCommentForFormatting.mockResolvedValueOnce(null);
      const result = await provider.formatAsWakaba(input, 'b', true, false);
      expect(result).toContain('>>789');
    });
  });

  describe('parseCommentLinks', () => {
    it('should replace comment links correctly', async () => {
      commentPersistenceServiceMock.findCommentForFormatting.mockResolvedValueOnce({
        id: 'abc',
        num: 42n,
        parentId: null
      });
      const result = await provider['parseCommentLinks']('&gt;&gt;42', 'b');
      expect(result).toContain('<a href="/b/res/42.html#42">>>42</a>');
    });

    it('should leave comment link as is if not found', async () => {
      commentPersistenceServiceMock.findCommentForFormatting.mockResolvedValueOnce(null);
      const result = await provider['parseCommentLinks']('>>404', 'b');
      expect(result).toContain('>>404');
    });

    it('should handle comment link with parent', async () => {
      commentPersistenceServiceMock.findCommentForFormatting.mockResolvedValueOnce({
        parentId: 1,
        parent: { num: 777 }
      });
      const result = await provider['parseCommentLinks']('&gt;&gt;55', 'b');
      expect(result).toContain('<a href="/b/res/777.html#55">>>55</a>');
    });

    it('should handle multiple comment links', async () => {
      commentPersistenceServiceMock.findCommentForFormatting
        .mockResolvedValueOnce({ parentId: 10, parent: { num: 88 } })
        .mockResolvedValueOnce(null);
      const result = await provider['parseCommentLinks']('&gt;&gt;10 &gt;&gt;99', 'b');
      expect(result).toContain('<a href="/b/res/88.html#10">>>10</a>');
      expect(result).toContain('>>99');
    });

    it('should return original text if no matches', async () => {
      const result = await provider['parseCommentLinks']('no links here', 'b');
      expect(result).toBe('no links here');
    });
  });
});
