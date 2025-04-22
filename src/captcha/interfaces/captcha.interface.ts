/**
 * Captcha object
 */
export interface ICaptcha {
  /**
   * Captcha SVG image
   */
  image: string;

  /**
   * Encrypted answer
   */
  cryptoAnswer: string;
}
