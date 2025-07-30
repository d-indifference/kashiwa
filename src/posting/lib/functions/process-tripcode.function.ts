import * as crypt from 'unix-crypt-td-js';

/**
 * Generate tripcode from user's password
 * @param password Password mapped from username
 */
export const processTripcode = (password: string): string => {
  const salt = generateSalt(password);

  const hashed = crypt(password, salt);

  return hashed.slice(-10);
};

const generateSalt = (password: string): string => {
  let salt = password.slice(0, 2);

  salt = salt.replace(/[^\.-z]/g, '.');

  salt = salt.replace(/[:;<=>?@[\\\]^_`]/g, (c: string): string => {
    const code = c.charCodeAt(0);
    if (code >= 58 && code <= 63) {
      return String.fromCharCode(code - 58 + 65);
    } else if (code >= 91 && code <= 96) {
      return String.fromCharCode(code - 91 + 97);
    }
    return c;
  });

  return salt;
};
