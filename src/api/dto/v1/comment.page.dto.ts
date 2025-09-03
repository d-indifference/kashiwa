import { CommentDto } from '@api/dto/v1/comment.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for page of `Comment` objects
 */
export class CommentPageDto {
  /**
   * The paginated content for the current page
   */
  @ApiProperty({ description: 'The paginated content for the current page', type: [CommentDto] })
  content: CommentDto[];

  /**
   * The previous page number, or `null` if there is no previous page
   */
  @ApiProperty({
    description: 'The previous page number, or `null` if there is no previous page',
    example: 1,
    default: null,
    nullable: true,
    required: false
  })
  previous: number | null = null;

  /**
   * The next page number, or `null` if there is no next page
   */
  @ApiProperty({
    description: 'The next page number, or `null` if there is no next page',
    example: 3,
    default: null,
    nullable: true,
    required: false
  })
  next: number | null = null;

  /**
   * The current page number
   */
  @ApiProperty({ description: 'The current page number', example: 2, default: 0 })
  current: number = 0;

  /**
   * The total number of pages
   */
  @ApiProperty({ description: 'The total number of pages', example: 4 })
  total: number;
}
