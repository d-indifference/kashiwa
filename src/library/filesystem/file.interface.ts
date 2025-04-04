/**
 * Saved file from form data.
 */
export interface IFile {
  /**
   * File name.
   */
  originalName: string;

  /**
   * MIME-type.
   */
  mimeType: string;

  /**
   * File path directory.
   */
  path: string;

  /**
   * Extension.
   */
  ext: string;

  /**
   * File size (bytes).
   */
  size: number;
}
