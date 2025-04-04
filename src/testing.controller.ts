import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { FormDto } from './form.dto';
import { Response } from 'express';
import { FilesystemOperator, ImageboardFileProvider } from '@library/filesystem';

@Controller()
export class TestingController {
  constructor(private readonly imageboardFileProvider: ImageboardFileProvider) {}

  @Get('/')
  @Render('index')
  public index(): void {}

  @Post('/upload')
  @FormDataRequest()
  public async upload(@Body() form: FormDto, @Res() res: Response): Promise<void> {
    const f = await this.imageboardFileProvider.saveFile(form.file, 'b', FilesystemOperator.md5(form.file.buffer));

    console.log(f);

    res.redirect('/');
  }
}
