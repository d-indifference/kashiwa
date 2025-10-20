import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { WhoisDto, WhoisResponseDto } from '@whois/dto';
import * as pug from 'pug';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map, of } from 'rxjs';

type QueryOptions = {
  enabled: boolean;
  apiAddress: string;
  apiMethod: string;
};

/**
 * Service responsible for retrieving WHOIS/GeoIP data based on the client's IP address
 */
@Injectable()
export class WhoisProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(WhoisProvider.name);
  }

  /**
   * Retrieves country information for the given IP address
   * @param ip Target IP address
   * @param allowGeoIp Whether GeoIP lookup is allowed at runtime (from board settings)
   */
  public async provideCountryInfo(ip: string, allowGeoIp: boolean): Promise<WhoisDto | null> {
    this.logger.debug({ ip }, 'provideCountryInfo');

    const enabled = this.config.getOrThrow<boolean>('whois.enabled');
    let whois: WhoisDto | null = null;

    if (enabled && allowGeoIp) {
      this.logger.debug({ enabled, allowGeoIp }, 'whois is enabled, trying to fetch it');

      const params = this.fetchParams();

      whois = await this.fetchWhois(ip, params);
    } else {
      this.logger.debug({ enabled, allowGeoIp }, 'whois is disabled, skipping it...');
    }

    return whois;
  }

  /**
   * Executes the WHOIS API request for a given IP
   */
  private async fetchWhois(ip: string, params: QueryOptions): Promise<WhoisDto | null> {
    this.logger.debug({ ip, params }, 'fetchWhois');

    const apiAddress = this.precompileApiString(params.apiAddress, ip);

    const $whoisResult = this.httpService
      .request<WhoisResponseDto>({
        url: apiAddress,
        method: params.apiMethod
      })
      .pipe(
        map(response => {
          const data = response.data;

          this.logger.debug({ data }, '[SUCCESS] fetchWhois');

          if (data.success) {
            return new WhoisDto(data.flag.img, data.country);
          }
          return null;
        }),
        catchError(err => {
          this.logger.error(err, '[ERROR] fetchWhois');

          return of(null);
        })
      );

    return await firstValueFrom($whoisResult);
  }

  /**
   * Compiles a WHOIS API URL template into a final string
   */
  private precompileApiString(apiAddress: string, ip: string): string {
    const compiledAddress = pug.compile(`| ${apiAddress}`)({ ip });
    this.logger.debug({ compiledAddress }, '[RESULT] precompileApiString');

    return compiledAddress;
  }

  /**
   * Retrieves WHOIS query configuration parameters from the application settings
   */
  private fetchParams(): QueryOptions {
    return {
      enabled: this.config.getOrThrow<boolean>('whois.enabled'),
      apiAddress: this.config.getOrThrow<string>('whois.api.address'),
      apiMethod: this.config.getOrThrow<string>('whois.api.method')
    };
  }
}
