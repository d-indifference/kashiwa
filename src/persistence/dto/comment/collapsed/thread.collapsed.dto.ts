import { CommentDto } from '@persistence/dto/comment/common';

/**
 * Collapsed DTO for thread preview with omitted posts counts
 */
export class ThreadCollapsedDto {
  /**
   * Thread
   */
  thread: CommentDto;

  /**
   * Total omitted posts count
   */
  omittedPosts: number = 0;

  /**
   * Count of omitted posts with files
   */
  omittedFiles: number = 0;
}
