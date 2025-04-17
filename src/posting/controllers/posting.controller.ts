import { Body, Controller, Param, Post, Res, Session, ValidationPipe } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { PostingService } from '@posting/services';
import { ISession } from '@admin/interfaces';

@Controller('kashiwa/post')
export class PostingController {
  constructor(private readonly postingService: PostingService) {}

  @Post(':url')
  @FormDataRequest()
  public async createThread(
    @Param('url') url: string,
    @Body(new ValidationPipe({ transform: true })) form: ThreadCreateForm,
    @Res() res: Response,
    @RealIP() ip: string,
    @Session() session: ISession
  ): Promise<void> {
    await this.postingService.createThread(url, form, ip, res, Boolean(session.payload));
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
    await this.postingService.createReply(url, BigInt(num), form, ip, res, Boolean(session.payload));
  }
}
