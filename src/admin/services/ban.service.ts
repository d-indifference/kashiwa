import { Injectable } from '@nestjs/common';
import { BanPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { FormPage, ListPage } from '@admin/pages';
import { BanCreateDto, BanDto } from '@persistence/dto/ban';
import { ISession } from '@admin/interfaces';
import { BanCreateForm } from '@admin/forms/ban';
import { Response } from 'express';

/**
 * A service for the operations of `Ban` model
 */
@Injectable()
export class BanService {
  constructor(private readonly banPersistenceService: BanPersistenceService) {}

  /**
   * Get page of current bans
   * @param session Session object
   * @param page Page request
   */
  public async getBanPage(session: ISession, page: PageRequest): Promise<ListPage<BanDto>> {
    const bans = await this.banPersistenceService.findAll(page);

    return new ListPage(session, bans);
  }

  /**
   * Get ban creation form
   * @param session Session object
   * @param ip IP preset
   */
  public getBanForm(session: ISession, ip?: string): FormPage<BanCreateForm> {
    const formContent = new BanCreateForm();

    if (ip) {
      formContent.ip = ip;
    }

    return new FormPage(session, 'CREATE', formContent);
  }

  /**
   * Get ban creation form
   * @param session Session object
   * @param form Form of new ban creation
   * @param res `Express.js` response
   */
  public async create(session: ISession, form: BanCreateForm, res: Response): Promise<void> {
    const dto = new BanCreateDto(form.ip, form.timeValue, form.timeUnit, form.reason);

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
