import { Controller, Get, Query, Render, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { ModerationPageService } from '@admin/services';
import { SessionGuard } from '@admin/guards';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { ListPage } from '@admin/pages';
import { BoardShortDto } from '@persistence/dto/board';

@Controller('kashiwa/moderation')
export class ModerationController {
  constructor(private readonly moderationPageService: ModerationPageService) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/moderation/admin-moderation-boards-list')
  public async getBoardsList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<BoardShortDto>> {
    return await this.moderationPageService.getBoardsList(page, session);
  }
}
