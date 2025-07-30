import { Body, Controller, Param, Post, Res, Session, ValidationPipe } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { ISession } from '@admin/interfaces';
import { CommentCreateService } from '@posting/services';
import { RestrictionService, RestrictionType } from '@restriction/services';

@Controller('kashiwa/post')
export class PostingController {
  constructor(
    private readonly commentCreateService: CommentCreateService,
    private readonly restrictionService: RestrictionService
  ) {}

  @Post(':url')
  @FormDataRequest()
  public async createThread(
    @Param('url') url: string,
    @Body(new ValidationPipe({ transform: true })) form: ThreadCreateForm,
    @Res() res: Response,
    @RealIP() ip: string,
    @Session() session: ISession
  ): Promise<void> {
    await this.restrictionService.checkRestrictions(RestrictionType.THREAD, ip, url, form, Boolean(session.payload));
    await this.commentCreateService.createThread(url, form, ip, res, Boolean(session.payload));
  }

  @Post(':url/:num')
  @FormDataRequest()
  public async createReply(
    @Param('url') url: string,
    @Param('num') num: string,
    @Body(new ValidationPipe({ transform: true })) form: ReplyCreateForm,
    @Res() res: Response,
    @RealIP() ip: string,
    @Session() session: ISession
  ): Promise<void> {
    await this.restrictionService.checkRestrictions(RestrictionType.REPLY, ip, url, form, Boolean(session.payload));
    await this.commentCreateService.createReply(url, BigInt(num), form, ip, res, Boolean(session.payload));
  }
}
