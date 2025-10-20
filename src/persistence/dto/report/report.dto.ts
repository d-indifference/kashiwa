import { ReportType } from '@prisma/client';
import { CommentModerationDto } from '@persistence/dto/comment/moderation';

/**
 * DTO for comment reports
 */
export class ReportDto {
  /**
   * ID
   */
  id: string;

  /**
   * Date of report creation
   */
  createdAt: Date;

  /**
   * Type of rules violation
   * - `COMMENT`: A comment that violates the rules
   * - `FILE`: A file that violates the rules
   */
  reportType: ReportType;

  /**
   * Comment
   */
  comment: CommentModerationDto;

  constructor(id: string, createdAt: Date, reportType: ReportType, comment: CommentModerationDto) {
    this.id = id;
    this.createdAt = createdAt;
    this.reportType = reportType;
    this.comment = comment;
  }
}
