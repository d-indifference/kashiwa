import { AttachedFileDto } from '@api/dto/v1/attached-file.dto';
import { ApiProperty } from '@nestjs/swagger';

export const DEFAULT_NO_CHILDREN_COMMENT_EXAMPLE = {
  num: 101n.toString(),
  createdAt: new Date(),
  isAdmin: false,
  name: 'Anonymous',
  tripcode: '!3GqYIJ3Obs',
  subject: 'Sup 2ch!',
  email: 'example@example.com',
  comment: '<p>Hello guys!</p>',
  hasSage: false,
  attachedFile: {
    path: '/b/src/1234567890.png',
    size: 3000000,
    width: 640,
    height: 480,
    mime: 'image/png',
    isImage: true,
    isVideo: false,
    thumbnailPath: '/b/thumb/1234567890s.png',
    thumbnailWidth: 200,
    thumbnailHeight: 160
  }
};

/**
 * DTO for `Comment` object
 */
export class CommentDto {
  /**
   * Thread number
   */
  @ApiProperty({ description: 'Thread number', example: 100n.toString(), type: BigInt })
  num: string;

  /**
   * Creation date
   */
  @ApiProperty({ description: 'Creation date', example: new Date() })
  createdAt: Date;

  /**
   * Is comment written by admin
   */
  @ApiProperty({ description: 'Is comment written by admin', example: false })
  isAdmin: boolean;

  /**
   * Poster`s name
   */
  @ApiProperty({ description: 'Poster`s name', example: 'Anonymous' })
  name: string;

  /**
   * Poster`s tripcode
   */
  @ApiProperty({ description: 'Poster`s tripcode', example: '!3GqYIJ3Obs', nullable: true, required: false })
  tripcode: string | null;

  /**
   * Subject
   */
  @ApiProperty({ description: 'Subject', example: 'Sup 2ch!', nullable: true, required: false })
  subject: string | null;

  /**
   * Email
   */
  @ApiProperty({ description: 'Email', example: 'example@example.com', nullable: true, required: false })
  email: string | null;

  /**
   * Comment text
   */
  @ApiProperty({ description: 'Comment text', example: '<p>Hello guys!</p>' })
  comment: string;

  /**
   * Is post has sage (don`t rise the thread up)
   */
  @ApiProperty({ description: 'Is post has sage (don`t rise the thread up)', example: false })
  hasSage: boolean;

  /**
   * Attached file
   */
  @ApiProperty({ description: 'Attached file', type: AttachedFileDto, nullable: true, required: false })
  attachedFile: AttachedFileDto | null;

  /**
   * List of post replies
   */
  @ApiProperty({
    isArray: true,
    nullable: true,
    type: [CommentDto],
    description: 'List of post replies',
    example: [DEFAULT_NO_CHILDREN_COMMENT_EXAMPLE]
  })
  children: CommentDto[] | undefined;
}
