/**
 * DTO of attached file
 */
export class AttachedFileDto {
  /**
   * File name
   */
  name: string;

  /**
   * File size
   */
  size: number;

  /**
   * Image width
   */
  width: number | null;

  /**
   * Image height
   */
  height: number | null;

  /**
   * MIME-type
   */
  mime: string;

  /**
   * Is file an image
   */
  isImage: boolean;

  /**
   * Is file a video
   */
  isVideo: boolean;

  /**
   * Thumbnail file name (actual for images)
   */
  thumbnail: string | null;

  /**
   * Thumbnail image width (actual for images)
   */
  thumbnailWidth: number | null;

  /**
   * Thumbnail image height (actual for images)
   */
  thumbnailHeight: number | null;

  constructor(
    name: string,
    size: number,
    width: number | null,
    height: number | null,
    mime: string,
    isImage: boolean,
    isVideo: boolean,
    thumbnail: string | null,
    thumbnailWidth: number | null,
    thumbnailHeight: number | null
  ) {
    this.name = name;
    this.size = size;
    this.width = width;
    this.height = height;
    this.mime = mime;
    this.isImage = isImage;
    this.isVideo = isVideo;
    this.thumbnail = thumbnail;
    this.thumbnailWidth = thumbnailWidth;
    this.thumbnailHeight = thumbnailHeight;
  }
}
