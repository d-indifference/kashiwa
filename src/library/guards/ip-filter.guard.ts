import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { getClientIp } from '@supercharge/request-ip';
import { LOCALE } from '@locale/locale';
import { FileSystemProvider, IpBlacklistProvider } from '@library/providers';
import { Constants } from '@library/constants';

/**
 * Filtering of permanent banned IPs
 */
@Injectable()
export class IpFilterGuard implements CanActivate {
  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly ipBlacklistProvider: IpBlacklistProvider
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = getClientIp(request);

    if (!clientIp) {
      throw new ForbiddenException(LOCALE['UNABLE_TO_DETERMINATE_IP']);
    }

    return !this.ipBlacklistProvider.isIpBlocked(clientIp);
  }

  /**
   * Load IP blacklist to memory
   */
  public async load(): Promise<void> {
    const blackListRelativePath = [Constants.SETTINGS_DIR, Constants.BLACK_LIST_FILE_NAME];

    if (!(await this.fileSystem.pathExists(blackListRelativePath))) {
      await this.fileSystem.writeTextFile(blackListRelativePath, '\r\n');
    }

    const blackList = await this.fileSystem.readTextFile(blackListRelativePath);
    global.ipBlackList = blackList.split('\r\n');
    global.ipBlackList.pop();

    this.ipBlacklistProvider.reloadBlacklist();
  }
}
