import { BoardDto } from '@persistence/dto/board';
import { LOCALE } from '@locale/locale';

/**
 * Set username or get default from board settings
 * @param name Name from form
 * @param board Board with settings
 * @param isAdmin Is user admin / moderator?
 */
export const processName = (name: string | undefined, board: BoardDto, isAdmin: boolean): string => {
  if (name) {
    return name;
  }

  if (!board.boardSettings) {
    return isAdmin ? (LOCALE['MODERATOR'] as string) : (LOCALE['ANONYMOUS'] as string);
  }

  return isAdmin ? board.boardSettings?.defaultModeratorName : board.boardSettings?.defaultPosterName;
};
