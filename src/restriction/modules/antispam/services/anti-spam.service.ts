import { BadRequestException, Injectable } from '@nestjs/common';

/** Base template for a posting form  */
interface PostingForm {
  name?: string;
  email?: string;
  subject?: string;
  comment: string;
}

/**
 * Service for spam protection
 */
@Injectable()
export class AntiSpamService {
  /**
   * Check if the spam is contained in Name, Email, Subject and Comment fields
   * If spam is detected, throws 400.
   * @param form Posting form
   * @param isAdmin Check if poster is administrator or moderator
   */
  public checkSpam<T extends PostingForm>(form: T, isAdmin: boolean): void {
    if (!isAdmin) {
      const spamExpressions: string[] = global.spamExpressions;

      for (const exp of spamExpressions) {
        this.testRegExp(exp, form.name);
        this.testRegExp(exp, form.email);
        this.testRegExp(exp, form.subject);
        this.testRegExp(exp, form.comment);
      }
    }
  }

  /** Tests regexp. If matched, throw 400 */
  private testRegExp(pattern: string, input?: string): void {
    const regex = new RegExp(pattern, 'ig');

    if (input) {
      if (regex.test(input)) {
        throw new BadRequestException(`Your input contains spam: ${pattern}`);
      }
    }
  }
}
