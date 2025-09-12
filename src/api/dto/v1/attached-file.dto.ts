import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for `AttachedFile` object
 */
export class AttachedFileDto {
  /**
   * Source file path
   */
  @ApiProperty({ description: 'Source file path', example: '/b/src/1234567890.png' })
  path: string;

  /**
   * Source file size (bytes)
   */
  @ApiProperty({ description: 'Source file size (bytes)', example: 3000000 })
  size: number;

  /**
   * Source file width
   */
  @ApiProperty({ description: 'Source file width', example: 640, nullable: true, required: false })
  width: number | null;

  /**
   * Source file height
   */
  @ApiProperty({ description: 'Source file height', example: 480, nullable: true, required: false })
  height: number | null;

  /**
   * File MIME-type
   */
  @ApiProperty({ description: 'File MIME-type', example: 'image/png' })
  mime: string;

  /**
   * Is file an image
   */
  @ApiProperty({ description: 'Is file an image', example: true })
  isImage: boolean;

  /**
   * Is file a video
   */
  @ApiProperty({ description: 'Is file a video', example: false })
  isVideo: boolean;

  /**
   * Thumbnail file path
   */
  @ApiProperty({
    description: 'Thumbnail file path',
    example: '/b/thumb/1234567890s.png',
    nullable: true,
    required: false
  })
  thumbnailPath: string | null;

  /**
   * Thumbnail file width
   */
  @ApiProperty({ description: 'Thumbnail file width', example: 200, nullable: true, required: false })
  thumbnailWidth: number | null;

  /**
   * Thumbnail file height
   */
  @ApiProperty({ description: 'Thumbnail file height', example: 160, nullable: true, required: false })
  thumbnailHeight: number | null;
}
