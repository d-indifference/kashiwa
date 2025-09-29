import { Controller, Get, HttpStatus, Param, Query, UseFilters, ValidationPipe } from '@nestjs/common';
import { CommentService } from '@api/services';
import { Constants } from '@library/constants';
import { CommentDto, CommentPageDto, DEFAULT_NO_CHILDREN_COMMENT_EXAMPLE, ErrorDto, PageRequestDto } from '@api/dto/v1';
import { ParseBigintPipe } from '@library/pipes';
import { RestExceptionFilter } from '@api/filters';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

@Controller('api/v1')
@UseFilters(RestExceptionFilter)
@ApiTags('Getting comments')
@ApiResponse({ type: ErrorDto, description: 'Bad request', status: HttpStatus.BAD_REQUEST })
@ApiResponse({ type: ErrorDto, description: 'Not found', status: HttpStatus.NOT_FOUND })
@ApiResponse({ type: ErrorDto, description: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR })
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(CommentController.name);
  }

  @Get(`:url/${Constants.RES_DIR}/:num`)
  @ApiOperation({ summary: 'Find the thread with replies' })
  @ApiParam({ name: 'url', description: 'Board URL', example: 'b' })
  @ApiParam({ name: 'num', description: 'Post number', example: 1n.toString() })
  @ApiResponse({ type: CommentDto, description: 'Thread with replies', status: HttpStatus.OK })
  public async findThread(@Param('url') url: string, @Param('num', ParseBigintPipe) num: bigint): Promise<CommentDto> {
    this.logger.debug(`URL called: GET /api/v1/${url}/${Constants.RES_DIR}/${num}`);

    return await this.commentService.findThread(url, num);
  }

  @Get(':url/:num')
  @ApiOperation({ summary: 'Find post' })
  @ApiParam({ name: 'url', description: 'Board URL', example: 'b' })
  @ApiParam({ name: 'num', description: 'Post number', example: 1n.toString() })
  @ApiResponse({
    type: CommentDto,
    description: 'Thread with replies',
    status: HttpStatus.OK,
    example: DEFAULT_NO_CHILDREN_COMMENT_EXAMPLE
  })
  public async findPost(@Param('url') url: string, @Param('num', ParseBigintPipe) num: bigint): Promise<CommentDto> {
    this.logger.debug(`URL called: GET /api/v1/${url}/${num}`);

    return await this.commentService.findPost(url, num);
  }

  @Get(':url')
  @ApiOperation({ summary: 'Find page of threads' })
  @ApiParam({ name: 'url', description: 'Board URL', example: 'b' })
  @ApiQuery({ name: 'page', description: 'Page number', default: 0, required: false, example: 0 })
  @ApiQuery({
    name: 'limit',
    description: 'Page size',
    default: Constants.DEFAULT_PAGE_SIZE,
    required: false,
    example: 10
  })
  @ApiResponse({
    type: CommentPageDto,
    description: 'Page of comments',
    status: HttpStatus.OK
  })
  public async findThreadsPage(
    @Param('url') url: string,
    @Query(new ValidationPipe({ transform: true })) pageRequest: PageRequestDto
  ): Promise<CommentPageDto> {
    this.logger.debug({ pageRequest }, `URL called: GET /api/v1/${url}`);

    return await this.commentService.findThreadsPage(url, pageRequest);
  }
}
