/**
 * DTO with whois IP info for saving with the comment
 */
export class WhoisDto {
  /**
   * Country flag image link
   */
  flag: string;

  /**
   * Country name
   */
  country: string;

  constructor(flag: string, country: string) {
    this.flag = flag;
    this.country = country;
  }
}
