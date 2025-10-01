import { Body, Controller, Param, Post, Res, Session, ValidationPipe } from '@nestjs/common';
import { FormDataRequest, MemoryStoredFile } from 'nestjs-form-data';
import { ReplyCreateForm, ThreadCreateForm } from '@posting/forms';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { ISession } from '@admin/interfaces';
import { CommentCreateService } from '@posting/services';
import { RestrictionService, RestrictionType } from '@restriction/services';
import { ParticleStoredFile } from 'nestjs-form-data/dist/interfaces/ParticleStoredFile';
import { Readable as ReadableStream } from 'stream';
import { nestjsFormDataConfig } from '@config/nestjs-form-data.config';

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
    await this.normalizeOekaki(form);
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
    await this.normalizeOekaki(form);
    await this.restrictionService.checkRestrictions(RestrictionType.REPLY, ip, url, form, Boolean(session.payload));
    await this.commentCreateService.createReply(url, BigInt(num), form, ip, res, Boolean(session.payload));
  }

  private async normalizeOekaki(form: ThreadCreateForm): Promise<void> {
    if (form.oekaki) {
      const oekakiMeta: ParticleStoredFile = {
        mimetype: 'image/png',
        encoding: '7-bit',
        originalName: `${Date.now()}.png`
      };

      const oekakiFile = await MemoryStoredFile.create(
        oekakiMeta,
        this.base64ToStream(form.oekaki),
        nestjsFormDataConfig
      );

      form.file = oekakiFile;
      form.oekaki = undefined;
    }
  }

  private base64ToStream(base64: string): ReadableStream {
    // const matches = base64.match(/^data:.+;base64,(.*)$/);
    // const base64Data = matches ? matches[1] : base64;
    const buffer = Buffer.from(base64, 'base64');

    const stream = new ReadableStream();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
