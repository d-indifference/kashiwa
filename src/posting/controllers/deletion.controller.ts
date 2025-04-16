import { Body, Controller, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { PostsDeleteForm } from '@posting/forms';
import { DeletionService } from '@posting/services';

@Controller('kashiwa/delete')
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @Post(':url')
  @FormDataRequest()
  public async deleteFromBoardPage(
    @Param('url') url: string,
    @Body(new ValidationPipe({ transform: true })) form: PostsDeleteForm,
    @Res() res: Response
  ): Promise<void> {
    await this.deletionService.processPostDeletion(url, form, res);
  }

  @Post(':url/:num')
  @FormDataRequest()
  public async deleteFromThreadPage(
    @Param('url') url: string,
    @Param('num') num: string,
    @Body(new ValidationPipe({ transform: true })) form: PostsDeleteForm,
    @Res() res: Response
  ): Promise<void> {
    await this.deletionService.processPostDeletion(url, form, res, num);
  }
}
