import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { getClientIp } from '@supercharge/request-ip';
import * as path from 'node:path';
import { Constants } from '@library/constants';
import * as fsExtra from 'fs-extra';
import { FilesystemOperator } from '@library/filesystem';

/**
 * Loads blacklist to `global`
 */
export const loadBlackList = async (): Promise<void> => {
  const pathToFile = path.join(Constants.Paths.FILE_BLACK_LIST);

  if (!(await fsExtra.exists(pathToFile))) {
    await FilesystemOperator.overwriteFile(['_settings', 'black_list'], '\r\n');
  }

  const blackList = FilesystemOperator.readFile('_settings', 'black_list');

  global.ipBlackList = blackList.split('\r\n');
  global.ipBlackList.pop();
};

/**
 * Filtering of permanent banned IPs
 */
@Injectable()
export class IpFilterGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = getClientIp(request);

    if (!clientIp) {
      throw new ForbiddenException('Unable to determine client IP address');
    }

    for (const pattern of global.ipBlackList as string[]) {
      const regexpStr = `^${pattern}$`;
      const regex = new RegExp(regexpStr);
      if (regex.test(clientIp)) {
        return false;
      }
    }

    return true;
  }
}
