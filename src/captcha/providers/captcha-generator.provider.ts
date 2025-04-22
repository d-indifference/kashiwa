import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as svgCaptcha from 'svg-captcha';
import { ICaptcha } from '@captcha/interfaces';
import * as bcrypt from 'bcrypt';

/**
 * Provider for captcha generation
 */
@Injectable()
export class CaptchaGeneratorProvider {
  constructor(private readonly config: ConfigService) {}

  /**
   * Generate a new captcha object
   * @param isCaseSensitive Is captcha case-sensitive
   */
  public async generate(isCaseSensitive: boolean = false): Promise<ICaptcha> {
    const captcha = this.create();

    if (isCaseSensitive) {
      return {
        image: captcha.data,
        cryptoAnswer: await bcrypt.hash(captcha.text, this.config.getOrThrow<number>('captcha.salt-rounds'))
      };
    }

    return {
      image: captcha.data,
      cryptoAnswer: await bcrypt.hash(captcha.text.toLowerCase(), this.config.getOrThrow<number>('captcha.salt-rounds'))
    };
  }

  private create(): svgCaptcha.CaptchaObj {
    const size = this.config.getOrThrow<number>('captcha.size');
    const ignoreChars = this.config.getOrThrow<string>('captcha.ignoreChars');
    const noise = this.config.getOrThrow<number>('captcha.noise');
    const color = this.config.getOrThrow<boolean>('captcha.color');
    const background = this.config.getOrThrow<string>('captcha.background');

    return svgCaptcha.create({ size, ignoreChars, noise, color, background });
  }
}
