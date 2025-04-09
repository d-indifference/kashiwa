import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { BoardMapper } from '@persistence/mappers';
import { Page, PageRequest } from '@persistence/lib/page';
import { BoardCreateDto, BoardDto, BoardShortDto } from '@persistence/dto/board';
import { Board } from '@prisma/client';
import { Constants } from '@library/constants';
import { BoardUpdateDto } from '@persistence/dto/board/board.update.dto';

@Injectable()
export class BoardPersistenceService {
  private readonly logger: Logger = new Logger(BoardPersistenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly boardMapper: BoardMapper
  ) {}

  public async findAll(page: PageRequest): Promise<Page<BoardShortDto>> {
    const boards = await Page.of<Board>(this.prisma, 'board', page);

    return boards.map(this.boardMapper.toShortDto);
  }

  public async findById(id: string): Promise<Board> {
    const board = await this.prisma.board.findFirst({ where: { id }, include: { boardSettings: true } });

    if (!board) {
      throw new NotFoundException(`Board with id: ${id} was not found`);
    }

    return board;
  }

  public async findByUrl(url: string): Promise<BoardDto> {
    const board = await this.prisma.board.findFirst({ where: { url }, include: { boardSettings: true } });

    if (!board) {
      throw new NotFoundException(`Board with url: ${url} was not found`);
    }

    if (!board.boardSettings) {
      throw new NotFoundException(`Board settings for board with url: ${url} was not found`);
    }

    return this.boardMapper.toDto(board, board.boardSettings);
  }

  public async create(dto: BoardCreateDto): Promise<BoardDto> {
    this.logger.log(`create: BoardCreateDto ${JSON.stringify(dto)}`);

    await this.checkOnCreate(dto);

    const input = this.boardMapper.create(dto);

    const createdBoard = await this.prisma.board.create({ data: input, include: { boardSettings: true } });

    return this.boardMapper.toDto(createdBoard, createdBoard.boardSettings);
  }

  public async update(dto: BoardUpdateDto): Promise<BoardDto> {
    this.logger.log(`update: BoardUpdateDto ${JSON.stringify(dto)}`);

    await this.checkOnUpdate(dto);

    const input = this.boardMapper.update(dto);

    const updatedBoard = await this.prisma.board.update({
      where: { id: dto.id },
      data: input,
      include: { boardSettings: true }
    });

    return this.boardMapper.toDto(updatedBoard, updatedBoard.boardSettings);
  }

  public async remove(id: string): Promise<void> {
    this.logger.log(`remove: id: ${id}`);

    await this.findById(id);

    await this.prisma.board.delete({ where: { id }, include: { boardSettings: true } });
  }

  private async checkOnCreate(dto: BoardCreateDto): Promise<void> {
    if (Constants.RESERVED_BOARD_URLS.includes(dto.url)) {
      throw new BadRequestException(
        `URL: '/${dto.url}' is reserved by system. You cannot create a board with this URL.`
      );
    }

    const boardByUrl = await this.prisma.board.findFirst({ where: { url: dto.url } });

    if (boardByUrl) {
      throw new BadRequestException(`Board with URL: '/${dto.url}' is already exists`);
    }
  }

  private async checkOnUpdate(dto: BoardUpdateDto): Promise<void> {
    await this.findById(dto.id);

    if (dto.url) {
      if (Constants.RESERVED_BOARD_URLS.includes(dto.url)) {
        throw new BadRequestException(
          `URL: '/${dto.url}' is reserved by system. You cannot create a board with this URL.`
        );
      }

      const boardByUrl = await this.prisma.board.findFirst({ where: { url: dto.url } });

      if (boardByUrl) {
        if (boardByUrl.id !== dto.id) {
          throw new BadRequestException(`Board with URL: '/${dto.url}' is already exists`);
        }
      }
    }
  }
}
