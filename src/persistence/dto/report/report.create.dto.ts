import { ReportType } from '@prisma/client';

/**
 * DTO for creation of comment report
 */
export class ReportCreateDto {
  /**
   * Board URL
   */
  boardUrl: string;

  /**
   * Comment numbers that are being reported
   */
  nums: bigint[];

  /**
   * Type of rules violation
   * - `COMMENT`: A comment that violates the rules
   * - `FILE`: A file that violates the rules
   */
  reportType: ReportType;

  constructor(boardUrl: string, nums: bigint[], reportType: ReportType) {
    this.boardUrl = boardUrl;
    this.nums = nums;
    this.reportType = reportType;
  }
}
