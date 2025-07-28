import { BadRequestException, Injectable } from '@nestjs/common';
import { LOCALE } from '@locale/locale';
import { SiteContextProvider } from '@library/providers';

/** Base template for a posting form  */
interface PostingForm {
  name?: string;
  email?: string;
  subject?: string;
  comment: string;
}

/**
 * Service for spam protection.
 * Uses regular expressions from site context to validate user-submitted fields.
 */
@Injectable()
export class AntiSpamService {
  private compiledSpamRegexes: RegExp[];

  constructor(private readonly siteContext: SiteContextProvider) {
    this.compileSpamRegexes();
  }

  /**
   * Get spam base from memory and compile it to regexp array
   */
  public compileSpamRegexes(): void {
    this.compiledSpamRegexes = ((this.siteContext.getSpamExpressions() || []) as string[]).map(
      pattern => new RegExp(this.escapeRegExp(pattern), 'i')
    );
  }

  /**
   * Checks the form fields for spam based on predefined regex patterns.
   * Throws an exception if a spam pattern is found in any field (for non-admins).
   * @param form The posting form to check
   * @param isAdmin Whether the user is an admin and should bypass the spam check
   */
  public checkSpam<T extends PostingForm>(form: T, isAdmin: boolean): void {
    if (isAdmin) {
      return;
    }

    const fieldsToCheck = [form.name, form.email, form.subject, form.comment];

    for (const regex of this.compiledSpamRegexes) {
      for (const field of fieldsToCheck) {
        if (field) {
          if (regex.test(field)) {
            throw new BadRequestException((LOCALE['INPUT_CONTAINS_SPAM'] as CallableFunction)(regex.source));
          }
        }
      }
    }
  }

  /**
   * Escapes regex meta-symbols
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
