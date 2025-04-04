import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { FormDto } from './form.dto';
import { Response } from 'express';
import { FilesystemOperator } from './library/filesystem';

@Controller()
export class TestingController {
  @Get('/')
  @Render('index')
  public index(): void {}

  @Post('/upload')
  @FormDataRequest()
  public async upload(@Body() form: FormDto, @Res() res: Response): Promise<void> {
    const file = await FilesystemOperator.fromFormData(form.file).save();
    console.log(file);

    res.redirect('/');
  }
}
