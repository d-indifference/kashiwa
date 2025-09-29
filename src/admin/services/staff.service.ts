import { Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { FormPage, RenderableSessionFormPage, TableConstructor } from '@admin/lib';
import { UserCreateDto, UserDto, UserUpdateDto } from '@persistence/dto/user';
import { LOCALE } from '@locale/locale';
import { TablePage } from '@admin/pages';
import { StaffCreateForm, StaffUpdateForm, StaffUpdateMyselfForm } from '@admin/forms/staff';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * Service for working with site moderation staff
 */
@Injectable()
export class StaffService {
  private readonly tableConstructor: TableConstructor<UserDto>;

  constructor(
    private readonly userPersistenceService: UserPersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.tableConstructor = new TableConstructor<UserDto>()
      .plainValue(LOCALE.USERNAME as string, 'username')
      .mappedValue(LOCALE.FORM_EMAIL as string, obj => `<a href="mailto:${obj.email}">${obj.email}</a>`)
      .plainValue(LOCALE.ROLE as string, 'role')
      .mappedValue('', obj => `<a href="/kashiwa/staff/edit/${obj.id}">[${LOCALE.EDIT as string}]</a>`);
    this.logger.setContext(StaffService.name);
  }

  /**
   * Get page of moderators & administrators
   * @param page Page request
   * @param session Session data
   */
  public async getList(page: PageRequest, session: ISession): Promise<TablePage> {
    this.logger.debug({ page, session }, 'getList');

    const users = await this.userPersistenceService.findAll(page);
    const table = this.tableConstructor.fromPage(users, '/kashiwa/staff');
    return new TablePage(table, session, {
      pageTitle: LOCALE.STAFF_PANEL as string,
      pageSubtitle: LOCALE.STAFF_LIST as string
    });
  }

  /**
   * Get form for current authorized profile edition
   * @param session Session data
   */
  public async getMyProfileForm(session: ISession): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session }, 'getMyProfileForm');

    const user = await this.userPersistenceService.findById(session.payload.id);

    const form = new StaffUpdateMyselfForm();
    form.username = user.username;
    form.email = user.email;

    return FormPage.toSessionTemplateContent(session, form, {
      pageTitle: LOCALE.STAFF_PANEL as string,
      pageSubtitle: LOCALE.EDIT_MY_PROFILE as string,
      goBack: '/kashiwa'
    });
  }

  /**
   * Get form for updating of user by its ID
   * @param session Session data
   * @param id User's ID
   */
  public async getForUpdate(session: ISession, id: string): Promise<RenderableSessionFormPage> {
    this.logger.debug({ session, id }, 'getForUpdate');

    const user = await this.userPersistenceService.findById(id);

    const form = new StaffUpdateForm();
    form.id = user.id;
    form.username = user.username;
    form.email = user.email;
    form.role = user.role;

    return FormPage.toEntityEditForm(session, form, `/kashiwa/staff/delete/${user.id}`, {
      pageTitle: LOCALE.STAFF_PANEL as string,
      pageSubtitle: LOCALE.EDIT_STAFF_MEMBER as string,
      goBack: '/kashiwa/staff'
    });
  }

  /**
   * Create new user
   * @param form Form data
   * @param res Express.js `res` object
   */
  public async create(form: StaffCreateForm, res: Response): Promise<void> {
    this.logger.info({ form: { ...form, password: '***' } }, 'create');
    this.logger.debug({ form }, 'create');

    const dto = new UserCreateDto(form.username, form.email, form.password, form.role);

    const newUser = await this.userPersistenceService.create(dto);

    res.redirect(`/kashiwa/staff/edit/${newUser.id}`);
  }

  /**
   * Update user
   * @param form Form data
   * @param res Express.js `res` object
   * @param redirect Redirect URL after successful updating
   * @param session Session data
   */
  public async update(
    form: StaffUpdateForm | StaffUpdateMyselfForm,
    res: Response,
    redirect: string,
    session: ISession
  ): Promise<void> {
    this.logger.info({ form: { ...form, password: '***' }, redirect, session }, 'update');
    this.logger.debug({ form, redirect, session }, 'update');

    const dto = new UserUpdateDto(
      form instanceof StaffUpdateForm ? form.id : session.payload.id,
      form.username,
      form.email,
      form.password,
      form instanceof StaffUpdateForm ? form.role : undefined
    );

    await this.userPersistenceService.update(dto);

    res.redirect(redirect);
  }

  /**
   * Delete user
   * @param id Object ID
   * @param res Express.js `res` object
   */
  public async remove(id: string, res: Response): Promise<void> {
    this.logger.info({ id }, 'remove');

    await this.userPersistenceService.remove(id);

    res.redirect('/kashiwa/staff');
  }
}
