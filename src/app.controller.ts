import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  public index(): void {}

  @Get('menu')
  @Render('menu')
  public menu(): void {}

  @Get('front')
  @Render('front')
  public front(): void {}

  @Get('faq')
  @Render('faq')
  public faq(): void {}

  @Get('rules')
  @Render('rules')
  public rules(): void {}
}
