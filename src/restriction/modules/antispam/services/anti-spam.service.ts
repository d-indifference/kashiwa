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
 * Service for spam protection
 */
@Injectable()
export class AntiSpamService {
  private readonly compiledSpamRegexes: RegExp[];

  constructor(private readonly siteContext: SiteContextProvider) {
    this.compiledSpamRegexes = ((this.siteContext.getSpamExpressions() || []) as string[]).map(
      pattern => new RegExp(pattern, 'ig')
    );
  }

  public checkSpam<T extends PostingForm>(form: T, isAdmin: boolean): void {
    if (isAdmin) {
      return;
    }

    const fieldsToCheck = [form.name, form.email, form.subject, form.comment];

    for (const regex of this.compiledSpamRegexes) {
      for (const field of fieldsToCheck) {
        if (field && regex.test(field)) {
          throw new BadRequestException((LOCALE['INPUT_CONTAINS_SPAM'] as CallableFunction)(regex.source));
        }
      }
    }
  }
}
