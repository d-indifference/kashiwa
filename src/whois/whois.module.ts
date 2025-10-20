import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WhoisProvider } from '@whois/providers';
import { HttpModule } from '@nestjs/axios';
import { axiosConfig } from '@whois/config';

/**
 * Module for the whois queries
 */
@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: axiosConfig
    })
  ],
  providers: [WhoisProvider],
  exports: [WhoisProvider]
})
export class WhoisModule {}
