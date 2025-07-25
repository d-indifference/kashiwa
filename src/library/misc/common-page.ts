/**
 * Common info for every page
 */
export type CommonPageCommons = {
  /** Page title (for `<title>...</title>`) */
  pageTitle: string;
  /** Page subtitle (for `<div class="theader">...</div>`) */
  pageSubtitle?: string;
  /** Link for "Go Back" link */
  goBack?: string;
};

/**
 * Base for template page
 */
export class CommonPage {
  /**
   * Common info for every page
   */
  commons: CommonPageCommons;
}
