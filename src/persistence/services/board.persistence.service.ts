import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { BoardMapper } from '@persistence/mappers';
import { Page, PageRequest } from '@persistence/lib/page';
import { BoardCreateDto, BoardDto, BoardShortDto, BoardUpdateDto } from '@persistence/dto/board';
import { Board } from '@prisma/client';
import { Constants } from '@library/constants';
import { FilesystemOperator } from '@library/filesystem';
import { AttachedFilePersistenceService } from '@persistence/services/attached-file.persistence.service';
import { LOCALE } from '@locale/locale';
import { PinoLogger } from 'nestjs-pino';

/**
 * Database queries for `Board` model
 */
@Injectable()
export class BoardPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardMapper: BoardMapper,
    private readonly attachedFilePersistenceService: AttachedFilePersistenceService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(BoardPersistenceService.name);
  }

  /**
   * Get page of boards by page request
   * @param page Page request
   */
  public async findAll(page: PageRequest): Promise<Page<BoardShortDto>> {
    const boards = await Page.of<Board>(this.prisma, 'board', page);

    return boards.map(this.boardMapper.toShortDto);
  }

  /**
   * Find board entity by ID and map it to DTO.
   * @param id Board's ID
   */
  public async findById(id: string): Promise<Board> {
    const board = await this.prisma.board.findFirst({ where: { id }, include: { boardSettings: true } });

    if (!board) {
      throw new NotFoundException((LOCALE['BOARD_WITH_ID_NOT_FOUND'] as CallableFunction)(id));
    }

    return board;
  }

  /**
   * Find board by ID and map it to `BoardDTO`
   * @param id Board's ID
   */
  public async findDtoById(id: string): Promise<BoardDto> {
    const board = await this.findById(id);

    return this.boardMapper.toDto(board, board['boardSettings']);
  }

  /**
   * Find board by ID and map it to `BoardShortDto`
   * @param id Board's ID
   */
  public async findShortDtoById(id: string): Promise<BoardShortDto> {
    const board = await this.findById(id);

    return this.boardMapper.toShortDto(board);
  }

  /**
   * Find board entity by URL and map it to DTO.
   * @param url Board's URL
   */
  public async findByUrl(url: string): Promise<BoardDto> {
    const board = await this.prisma.board.findFirst({ where: { url }, include: { boardSettings: true } });

    if (!board) {
      throw new NotFoundException((LOCALE['BOARD_BY_URL_NOT_FOUND'] as CallableFunction)(url));
    }

    if (!board.boardSettings) {
      throw new NotFoundException((LOCALE['BOARD_SETTINGS_BY_URL_NOT_FOUND'] as CallableFunction)(url));
    }

    return this.boardMapper.toDto(board, board.boardSettings);
  }

  /**
   * Get count of boards
   */
  public async countAll(): Promise<number> {
    return (await this.prisma.board.count()) as number;
  }

  /**
   * Get actual board post count by URL
   * @param url Board URL
   */
  public async getCurrentPostCount(url: string): Promise<number> {
    const response = await this.prisma.board.findFirst({ select: { postCount: true }, where: { url } });

    if (response === null) {
      throw new NotFoundException((LOCALE['BOARD_BY_URL_NOT_FOUND'] as CallableFunction)(url));
    }

    return response.postCount;
  }

  /**
   * Create a new board and return board DTO
   * @param dto Board's creation input
   */
  public async create(dto: BoardCreateDto): Promise<BoardDto> {
    this.logger.info(dto, 'create');

    await this.checkOnCreate(dto);

    const input = this.boardMapper.create(dto);

    const createdBoard = await this.prisma.board.create({ data: input, include: { boardSettings: true } });

    return this.boardMapper.toDto(createdBoard, createdBoard.boardSettings);
  }

  /**
   * Update a board and return board DTO
   * @param dto Board's update input
   */
  public async update(dto: BoardUpdateDto): Promise<BoardDto> {
    this.logger.info(dto, 'update');

    await this.checkOnUpdate(dto);

    const input = this.boardMapper.update(dto);

    const updatedBoard = await this.prisma.board.update({
      where: { id: dto.id },
      data: input,
      include: { boardSettings: true }
    });

    return this.boardMapper.toDto(updatedBoard, updatedBoard.boardSettings);
  }

  /**
   * Set board's `postCount` value to `0`
   * @param id `Board` ID
   */
  public async nullifyPostCount(id: string): Promise<void> {
    this.logger.info({ id }, 'nullifyPostCount');

    await this.prisma.board.update({ data: { postCount: 0 }, where: { id } });
  }

  /**
   * Increment board post count by URL
   * @param url Board URL
   */
  public async incrementPostCount(url: string): Promise<void> {
    this.logger.info({ url }, 'incrementPostCount');

    const board = await this.findByUrlNoMapping(url);

    await this.prisma.board.update({ data: { postCount: board.postCount + 1 }, where: { id: board.id } });
  }

  /**
   * Fully remove board by ID
   * @param id Board's ID
   */
  public async remove(id: string): Promise<void> {
    this.logger.info({ id }, 'remove');

    const board = await this.findById(id);

    await this.prisma.comment.deleteMany({ where: { boardId: id } });
    await FilesystemOperator.remove(board.url);
    await this.attachedFilePersistenceService.removeOrphaned();
    await this.prisma.board.delete({ where: { id }, include: { boardSettings: true } });
  }

  /**
   * Check board URL on creation
   */
  private async checkOnCreate(dto: BoardCreateDto): Promise<void> {
    if (Constants.RESERVED_BOARD_URLS.includes(dto.url)) {
      throw new BadRequestException((LOCALE['URL_IS_RESERVED'] as CallableFunction)(dto.url));
    }

    const boardByUrl = await this.prisma.board.findFirst({ where: { url: dto.url } });

    if (boardByUrl) {
      throw new BadRequestException((LOCALE['BOARD_ALREADY_EXISTS'] as CallableFunction)(dto.url));
    }
  }

  /**
   * Check board URL on updating
   */
  private async checkOnUpdate(dto: BoardUpdateDto): Promise<void> {
    await this.findById(dto.id);

    if (dto.url) {
      if (Constants.RESERVED_BOARD_URLS.includes(dto.url)) {
        throw new BadRequestException((LOCALE['URL_IS_RESERVED'] as CallableFunction)(dto.url));
      }

      const boardByUrl = await this.prisma.board.findFirst({ where: { url: dto.url } });

      if (boardByUrl) {
        if (boardByUrl.id !== dto.id) {
          throw new BadRequestException((LOCALE['BOARD_ALREADY_EXISTS'] as CallableFunction)(dto.url));
        }
      }
    }
  }

  /**
   * Find board entity by URL and return model
   */
  private async findByUrlNoMapping(url: string): Promise<Board> {
    const board = await this.prisma.board.findFirst({ where: { url } });

    if (!board) {
      throw new NotFoundException((LOCALE['BOARD_BY_URL_NOT_FOUND'] as CallableFunction)(url));
    }

    return board;
  }
}
