export class AttachedFileDto {
  name: string;

  size: number;

  width: number | null;

  height: number | null;

  mime: string;

  isImage: boolean;

  thumbnail: string | null;

  thumbnailWidth: number | null;

  thumbnailHeight: number | null;

  constructor(
    name: string,
    size: number,
    width: number | null,
    height: number | null,
    mime: string,
    isImage: boolean,
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
    this.thumbnail = thumbnail;
    this.thumbnailWidth = thumbnailWidth;
    this.thumbnailHeight = thumbnailHeight;
  }
}
