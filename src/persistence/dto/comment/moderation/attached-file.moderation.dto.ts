/**
 * DTO for attached file with moderation panel info
 */
export class AttachedFileModerationDto {
  /**
   * ID
   */
  id: string;

  /**
   * Board URL
   */
  boardUrl: string;

  /**
   * File name
   */
  name: string;

  /**
   * Thumbnail name
   */
  thumbnail: string | null;

  /**
   * Thumbnail width
   */
  thumbnailWidth: number | null;

  /**
   * Thumbnail height
   */
  thumbnailHeight: number | null;

  /**
   * Check if file is an image
   */
  isImage: boolean;

  /**
   * File MIME type
   */
  mime: string;

  constructor(
    id: string,
    boardUrl: string,
    name: string,
    thumbnail: string | null,
    thumbnailWidth: number | null,
    thumbnailHeight: number | null,
    isImage: boolean,
    mime: string
  ) {
    this.id = id;
    this.boardUrl = boardUrl;
    this.name = name;
    this.thumbnail = thumbnail;
    this.thumbnailWidth = thumbnailWidth;
    this.thumbnailHeight = thumbnailHeight;
    this.isImage = isImage;
    this.mime = mime;
  }
}
