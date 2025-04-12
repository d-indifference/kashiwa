import { BoardDto } from '@persistence/dto/board';
import { applicationVersion, fileSize, formatDateTime } from '@library/page-compiler';

export class BoardPage {
  board: BoardDto;

  fileSize: (size: number) => string = fileSize;

  formatDateTime: (dateTime: Date) => string = formatDateTime;

  applicationVersion: () => string | undefined = applicationVersion;

  constructor(board: BoardDto) {
    this.board = board;
  }
}
