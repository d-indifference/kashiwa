import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Render,
  Res,
  Session,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { SessionGuard } from '@admin/guards';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { BanService } from '@admin/services';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { BanCreateForm } from '@admin/forms/ban';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@library/transforms';
import { TablePage } from '@admin/pages';
import { RenderableSessionFormPage } from '@admin/lib';
import { PinoLogger } from 'nestjs-pino';

class BanCreationPreset {
  @Transform(emptyFormText)
  ip?: string;

  @Transform(emptyFormText)
  boardUrl?: string;
}

@Controller('kashiwa/ban')
export class BanController {
  constructor(
    private readonly banService: BanService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(BanController.name);
  }

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/common_table_page')
  public async getBanList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<TablePage> {
    this.logger.debug({ session, page }, 'URL called: GET /kashiwa/ban');

    return await this.banService.getBanPage(session, page);
  }

  @Get('new')
  @UseGuards(SessionGuard)
  @Render('admin/common_form_page')
  public getFormPage(
    @Session() session: ISession,
    @Query(new ValidationPipe({ transform: true })) query: BanCreationPreset
  ): RenderableSessionFormPage {
    this.logger.debug({ session, query }, 'URL called: GET /kashiwa/ban/new');

    return this.banService.getBanForm(session, query.ip, query.boardUrl);
  }

  @Post('new')
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async createBan(
    @Session() session: ISession,
    @Body(new ValidationPipe({ transform: true })) form: BanCreateForm,
    @Res() res: Response
  ): Promise<void> {
    this.logger.debug({ session, form }, 'URL called: POST /kashiwa/ban/new');

    await this.banService.create(session, form, res);
  }

  @Post('delete/:id')
  @UseGuards(SessionGuard)
  public async deleteBan(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    this.logger.debug(`URL called: POST /kashiwa/ban/delete/${id}`);

    await this.banService.remove(id, res);
  }
}
