/**
 * Escape HTML and protect it from HTML tags
 * @param text Comment test
 */
export const escapeHtml = (text: string): string => {
  const escapeChars: { [key: string]: string } = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
  };
  return text.replace(/[<>&"'/]/g, char => escapeChars[char]);
};
