import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for REST API error
 */
export class ErrorDto {
  /**
   * HTTP error status
   */
  @ApiProperty({ description: 'HTTP error status', example: HttpStatus.NOT_FOUND })
  statusCode: number;

  /**
   * HTTP error description
   */
  @ApiProperty({ description: 'HTTP error description', example: 'Post was not found' })
  message: string;

  /**
   * @param statusCode HTTP error status
   * @param message HTTP error description
   */
  constructor(statusCode: HttpStatus, message: string) {
    this.statusCode = statusCode.valueOf();
    this.message = message;
  }
}
