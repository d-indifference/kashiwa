import { BoardSettingsDto } from '@persistence/dto/board/board-settings.dto';

/**
 * DTO for board
 */
export class BoardDto {
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
   * Board settings
   */
  boardSettings?: BoardSettingsDto;

  /**
   * @param id ID
   * @param url Board URL path
   * @param name Board Name
   * @param boardSettings Board settings
   */
  constructor(id: string, url: string, name: string, boardSettings?: BoardSettingsDto) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.boardSettings = boardSettings;
  }
}
