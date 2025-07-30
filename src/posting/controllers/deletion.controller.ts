import { Body, Controller, Param, Post, Res, ValidationPipe } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { CommentDeleteService } from '@posting/services';
import { CommentDeleteForm } from '@posting/forms';
import { ParseBigintPipe } from '@library/pipes';

@Controller('kashiwa/delete')
export class DeletionController {
  constructor(private readonly commentDeleteService: CommentDeleteService) {}

  @Post(':url')
  @FormDataRequest()
  public async deleteFromBoardPage(
    @Param('url') url: string,
    @Body(new ValidationPipe({ transform: true })) form: CommentDeleteForm,
    @Res() res: Response
  ): Promise<void> {
    await this.commentDeleteService.deleteComment(url, form, res);
  }

  @Post(':url/:num')
  @FormDataRequest()
  public async deleteFromThreadPage(
    @Param('url') url: string,
    @Param('num', ParseBigintPipe) num: bigint,
    @Body(new ValidationPipe({ transform: true })) form: CommentDeleteForm,
    @Res() res: Response
  ): Promise<void> {
    await this.commentDeleteService.deleteComment(url, form, res, num);
  }
}
