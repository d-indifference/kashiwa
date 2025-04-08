import { Injectable } from '@nestjs/common';
import { UserPersistenceService } from '@persistence/services';
import { PageRequest } from '@persistence/lib/page';
import { ISession } from '@admin/interfaces';
import { FormPage, ListPage } from '@admin/pages';
import { UserCreateDto, UserDto, UserUpdateDto } from '@persistence/dto/user';
import { StaffCreateForm, StaffUpdateForm } from '@admin/forms/staff';
import { Response } from 'express';

/**
 * Service for working with site moderation staff
 */
@Injectable()
export class StaffService {
  constructor(private readonly userPersistenceService: UserPersistenceService) {}

  /**
   * Get page of moderators & administrators
   * @param page Page request
   * @param session Session data
   */
  public async getList(page: PageRequest, session: ISession): Promise<ListPage<UserDto>> {
    const users = await this.userPersistenceService.findAll(page);

    return new ListPage<UserDto>(session, users);
  }

  /**
   * Get form for current authorized profile edition
   * @param session Session data
   */
  public async getMyProfileForm(session: ISession): Promise<FormPage<StaffUpdateForm>> {
    const user = await this.userPersistenceService.findById(session.payload.id);

    const form: StaffUpdateForm = { id: user.id, username: user.username, email: user.email };

    return new FormPage(session, 'UPDATE', form);
  }

  /**
   * Create new user
   * @param form Form data
   * @param res Express.js `res` object
   */
  public async create(form: StaffCreateForm, res: Response): Promise<void> {
    const dto = new UserCreateDto(form.username, form.email, form.password, form.role);

    const newUser = await this.userPersistenceService.create(dto);

    res.redirect(`/kashiwa/staff/edit/${newUser.id}`);
  }

  /**
   * Get form for updating of user by its ID
   * @param session Session data
   * @param id User's ID
   */
  public async getForUpdate(session: ISession, id: string): Promise<FormPage<StaffUpdateForm>> {
    const user = await this.userPersistenceService.findById(id);

    const form: StaffUpdateForm = { id, username: user.username, email: user.email, role: user.role, password: '' };

    return new FormPage(session, 'UPDATE', form);
  }

  /**
   * Update user
   * @param form Form data
   * @param res Express.js `res` object
   * @param redirect Redirect URL after successful updating
   */
  public async update(form: StaffUpdateForm, res: Response, redirect: string): Promise<void> {
    const dto = new UserUpdateDto(form.id, form.username, form.email, form.password, form.role);

    await this.userPersistenceService.update(dto);

    res.redirect(redirect);
  }

  /**
   * Delete user
   * @param id Object ID
   * @param res Express.js `res` object
   */
  public async remove(id: string, res: Response): Promise<void> {
    await this.userPersistenceService.remove(id);

    res.redirect('/kashiwa/staff');
  }
}
