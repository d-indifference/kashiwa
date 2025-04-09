import { BoardSettingsDto } from '@persistence/dto/board/board-settings.dto';

export class BoardDto {
  id: string;

  url: string;

  name: string;

  boardSettings?: BoardSettingsDto;

  constructor(id: string, url: string, name: string, boardSettings?: BoardSettingsDto) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.boardSettings = boardSettings;
  }
}
