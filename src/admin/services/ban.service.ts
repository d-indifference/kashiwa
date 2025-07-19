import { ISession } from '@admin/interfaces';
import { Injectable } from '@nestjs/common';
import { PageRequest } from '@persistence/lib/page';
import { BanPersistenceService, BoardPersistenceService } from '@persistence/services';
import { FormPage, RenderableSessionFormPage, TableConstructor } from '@admin/lib';
import { BanCreateDto, BanDto, TimeUnits } from '@persistence/dto/ban';
import { LOCALE } from '@locale/locale';
import { TablePage } from '@admin/pages';
import { BanCreateForm } from '@admin/forms/ban';
import { Response } from 'express';
import { Constants } from '@library/constants';

/**
 * A service for the operations of `Ban` model
 */
@Injectable()
export class BanService {
  private readonly tableConstructor: TableConstructor<BanDto>;

  constructor(
    private readonly banPersistenceService: BanPersistenceService,
    private readonly boardPersistenceService: BoardPersistenceService
  ) {
    this.tableConstructor = new TableConstructor<BanDto>()
      .dateTimeValue(LOCALE.CREATED_AT as string, 'createdAt')
      .plainValue(LOCALE.IP as string, 'ip')
      .dateTimeValue(LOCALE.TILL as string, 'till')
      .plainValue(LOCALE.REASON as string, 'reason')
      .mappedValue(LOCALE.BOARDS as string, obj =>
        obj.boardUrl
          ? `/<a href="/${obj.boardUrl}/kashiwa${Constants.HTML_SUFFIX}" target="_blank">${obj.boardUrl}</a>/`
          : 'ALL'
      )
      .mappedValue(LOCALE.WHO_BANNED as string, obj => `${obj.user ? obj.user.username : '?'}`)
      .mappedValue(
        '',
        obj =>
          `<form method="post" action="/kashiwa/ban/delete/${obj.id}"><input type="submit" value="${LOCALE.DELETE as string}"></form>`
      );
  }

  /**
   * Get page of current bans
   * @param session Session object
   * @param page Page request
   */
  public async getBanPage(session: ISession, page: PageRequest): Promise<TablePage> {
    const bans = await this.banPersistenceService.findAll(page);
    const table = this.tableConstructor.fromPage(bans, '/kashiwa/ban');
    return new TablePage(table, session, {
      pageTitle: LOCALE.BANS as string,
      pageSubtitle: LOCALE.BANNED_IP_LIST as string
    });
  }

  /**
   * Get ban creation form
   * @param session Session object
   * @param ip IP preset
   * @param boardUrl URL of board where user should be banned
   */
  public getBanForm(session: ISession, ip?: string, boardUrl?: string): RenderableSessionFormPage {
    const formContent = new BanCreateForm();
    formContent.timeValue = 3;
    formContent.timeUnit = TimeUnits.HOURS;
    formContent.reason = LOCALE.BAN_REASON_DEFAULT as string;
    formContent.boardUrl = boardUrl ?? '';

    if (ip) {
      formContent.ip = ip ?? '';
    }

    return FormPage.toSessionTemplateContent(session, formContent, {
      goBack: '/kashiwa/ban',
      pageTitle: LOCALE.NEW_BAN as string,
      pageSubtitle: LOCALE.CREATE_NEW_BAN as string
    });
  }

  /**
   * Get ban creation form
   * @param session Session object
   * @param form Form of new ban creation
   * @param res `Express.js` response
   */
  public async create(session: ISession, form: BanCreateForm, res: Response): Promise<void> {
    const board = form.boardUrl ? (await this.boardPersistenceService.findByUrl(form.boardUrl)).id : null;
    const dto = new BanCreateDto(form.ip, form.timeValue, form.timeUnit, form.reason, board);

    await this.banPersistenceService.create(session.payload.id, dto);

    res.redirect('/kashiwa/ban');
  }

  /**
   * Delete a ban
   * @param id Ban ID
   * @param res `Express.js` response
   */
  public async remove(id: string, res: Response): Promise<void> {
    await this.banPersistenceService.remove(id);

    res.redirect('/kashiwa/ban');
  }
}
