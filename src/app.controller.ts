import { Controller, Get, Render } from '@nestjs/common';
import { CommonPage } from '@library/misc';
import { LOCALE } from '@locale/locale';

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
  public front(): CommonPage {
    return { commons: { pageTitle: LOCALE.MAIN_PAGE as string } };
  }

  @Get('faq')
  @Render('faq')
  public faq(): CommonPage {
    return { commons: { pageTitle: LOCALE.FAQ_PAGE as string } };
  }

  @Get('rules')
  @Render('rules')
  public rules(): CommonPage {
    return { commons: { pageTitle: LOCALE.RULES_PAGE as string } };
  }
}
