import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Provider for captcha solving
 */
@Injectable()
export class CaptchaSolvingPredicateProvider {
  /**
   * Predicate for checking of right solved captcha. Enabled only for non-admins
   * @param isAdmin Is user admin or moderator
   * @param rightAnswer Encrypted right answer
   * @param userAnswer User's answer
   */
  public async isCaptchaSolved(isAdmin: boolean, rightAnswer?: string, userAnswer?: string): Promise<boolean> {
    if (!isAdmin) {
      if (!rightAnswer) {
        return false;
      }

      if (!userAnswer) {
        return false;
      }

      return await bcrypt.compare(userAnswer, rightAnswer);
    }

    return true;
  }
}
