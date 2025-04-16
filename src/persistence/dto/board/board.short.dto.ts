/**
 * DTO for board (short version)
 */
export class BoardShortDto {
  /**
   * ID
   */
  id: string;

  /**
   * Board URL path
   */
  url: string;

  /**
   * Board Name
   */
  name: string;

  /**
   * Current post count
   */
  postCount: number;

  /**
   * @param id ID
   * @param url Board URL path
   * @param name Board Name
   * @param postCount Current post count
   */
  constructor(id: string, url: string, name: string, postCount: number) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.postCount = postCount;
  }
}
