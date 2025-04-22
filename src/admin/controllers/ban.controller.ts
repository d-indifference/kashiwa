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
import { FormPage, ListPage } from '@admin/pages';
import { BanDto } from '@persistence/dto/ban';
import { BanService } from '@admin/services';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { BanCreateForm } from '@admin/forms/ban';
import { Transform } from 'class-transformer';
import { emptyFormText } from '@admin/transforms';
import { simpleFormatDateTime } from '@library/page-compiler';

class IpQuery {
  @Transform(emptyFormText)
  ip?: string;
}

@Controller('kashiwa/ban')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Get()
  @UseGuards(SessionGuard)
  @Render('admin/ban/admin-ban-list')
  public async getBanList(
    @Query(new ValidationPipe({ transform: true })) page: PageRequest,
    @Session() session: ISession
  ): Promise<ListPage<BanDto> & { simpleFormatDateTime: (dateTime: Date) => string }> {
    const content = await this.banService.getBanPage(session, page);
    return { ...content, simpleFormatDateTime };
  }

  @Get('new')
  @UseGuards(SessionGuard)
  @Render('admin/ban/admin-ban-form')
  public getFormPage(
    @Session() session: ISession,
    @Query(new ValidationPipe({ transform: true })) query: IpQuery
  ): FormPage<BanCreateForm> {
    return this.banService.getBanForm(session, query.ip);
  }

  @Post('new')
  @UseGuards(SessionGuard)
  @FormDataRequest()
  public async createBan(
    @Session() session: ISession,
    @Body(new ValidationPipe({ transform: true })) form: BanCreateForm,
    @Res() res: Response
  ): Promise<void> {
    await this.banService.create(session, form, res);
  }

  @Post('delete/:id')
  @UseGuards(SessionGuard)
  public async deleteBan(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response): Promise<void> {
    await this.banService.remove(id, res);
  }
}
