/**
 * DTO with response of the IP whois service
 */
export class WhoisResponseDto {
  /**
   * User's IP
   */
  ip: string;

  /**
   * Is IP fetching success
   */
  success: boolean;

  /**
   * Country name
   */
  country: string;

  /**
   * Country flag info
   */
  flag: {
    /**
     * Country flag CDN image link
     */
    img: string;

    /**
     * Country flag emoji
     */
    emoji: string;
  };
}
