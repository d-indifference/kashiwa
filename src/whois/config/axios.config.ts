import { HttpModuleOptions } from '@nestjs/axios/dist/interfaces/http-module.interface';
import { ConfigService } from '@nestjs/config';

export const axiosConfig = (config: ConfigService): HttpModuleOptions => ({
  timeout: config.getOrThrow<number>('whois.api.timeout')
});
