import { BoardSettingsDto } from '@persistence/dto/board';

/**
 * Object for `Board` to its displaying on thread page
 */
export interface IBoard {
  /**
   * Board URL
   */
  url: string;

  /**
   * Board name
   */
  name: string;

  boardSettings: BoardSettingsDto | undefined;
}
