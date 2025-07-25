import { BoardDto } from '@persistence/dto/board';
import { Comment } from '@prisma/client';
import { processName } from '@posting/lib/functions/process-name.function';
import { processTripcode } from '@posting/lib/functions/process-tripcode.function';

/**
 * Set name and / or tripcode for poster
 * @param name Name from form
 * @param board Board with settings
 * @param isAdmin Is user admin / moderator?
 */
export const enrichName = (
  name: string | undefined,
  board: BoardDto,
  isAdmin: boolean
): Pick<Comment, 'name' | 'tripcode'> => {
  if (!name) {
    return { name: processName(name, board, isAdmin), tripcode: null };
  }

  const splitName = name.split('#');

  if (splitName.length > 1) {
    const password = splitName.slice(1).join('#');

    return { name: processName(splitName[0], board, isAdmin), tripcode: processTripcode(password) };
  }

  return { name: processName(splitName[0], board, isAdmin), tripcode: null };
};
