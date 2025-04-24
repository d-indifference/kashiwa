import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { UserCreateDto, UserDto, UserUpdateDto } from '@persistence/dto/user';
import { UserMapper } from '@persistence/mappers';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { Page, PageRequest } from '@persistence/lib/page';
import { LOCALE } from '@locale/locale';

/**
 * Database queries for `User` model
 */
@Injectable()
export class UserPersistenceService {
  private readonly logger: Logger = new Logger(UserPersistenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper
  ) {}

  /**
   * Get page of users by page request
   * @param page Page request
   */
  public async findAll(page: PageRequest): Promise<Page<UserDto>> {
    const entities = await Page.of<User>(this.prisma, 'user', page);

    return entities.map(this.userMapper.toDto);
  }

  /**
   * Find user by ID and map it to DTO. If user does not found, throws 404
   * @param id User's ID
   */
  public async findById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new NotFoundException((LOCALE['USER_WITH_ID_NOT_FOUND'] as CallableFunction)(id));
    }

    return this.userMapper.toDto(user);
  }

  /**
   * Get `User` total count
   */
  public async countAll(): Promise<number> {
    return (await this.prisma.user.count()) as number;
  }

  /**
   * Find user by ID and return model or null
   * @param id User's ID
   */
  public async findByIdStrict(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * Create a new user and return user DTO
   * @param dto User's creation input
   */
  public async create(dto: UserCreateDto): Promise<UserDto> {
    this.logger.log(`create: ${dto.toString()}`);

    await this.checkUniqueUser(dto);

    const input = await this.userMapper.create(dto);

    const createdUser = await this.prisma.user.create({ data: input });

    return this.userMapper.toDto(createdUser);
  }

  /**
   * Update a user and return user DTO
   * @param dto User's update input
   */
  public async update(dto: UserUpdateDto): Promise<UserDto> {
    this.logger.log(`update: ${dto.toString()}`);

    await this.checkUserOnUpdate(dto);

    const input = await this.userMapper.update(dto);

    const updatedUser = await this.prisma.user.update({ where: { id: dto.id }, data: input });

    return this.userMapper.toDto(updatedUser);
  }

  /**
   * Remove user by ID
   * @param id User's ID
   */
  public async remove(id: string): Promise<void> {
    this.logger.log(`remove: { id: "${id}" }`);

    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * Find user for sign in by its username & password. If user doesn't found, throws 401
   * @param username Username
   * @param password Non-hashed password
   */
  public async signIn(username: string, password: string): Promise<UserDto> {
    this.logger.log(`signIn: { username: "${username}", password: "***" }`);

    const user = await this.prisma.user.findFirst({ where: { username } });

    if (!user) {
      this.logger.warn(`[UNAUTHORIZED],  username: "${username}"`);
      throw new UnauthorizedException(LOCALE['WRONG_USERNAME_OR_PASSWORD']);
    }

    const isPasswordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordsMatch) {
      this.logger.warn(`[UNAUTHORIZED],  username: "${username}"`);
      throw new UnauthorizedException(LOCALE['WRONG_USERNAME_OR_PASSWORD']);
    }

    return user;
  }

  /**
   * Check if username is unique
   */
  private async checkUniqueUser(dto: UserCreateDto): Promise<void> {
    const entity = await this.prisma.user.findFirst({ where: { username: dto.username } });

    if (entity) {
      this.logger.warn((LOCALE['USER_ALREADY_EXISTS'] as CallableFunction)(dto.username));
      throw new BadRequestException((LOCALE['USER_ALREADY_EXISTS'] as CallableFunction)(dto.username));
    }
  }

  /**
   * Check user existing and uniqueness of username on update
   */
  private async checkUserOnUpdate(dto: UserUpdateDto): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id: dto.id } });

    if (!user) {
      throw new NotFoundException((LOCALE['USER_WITH_ID_NOT_FOUND'] as CallableFunction)(dto.id));
    }

    const userByUsername = await this.prisma.user.findFirst({ where: { username: dto.username } });

    if (userByUsername) {
      if (userByUsername.id !== user.id) {
        this.logger.warn((LOCALE['USER_ALREADY_EXISTS'] as CallableFunction)(dto.username));
        throw new BadRequestException((LOCALE['USER_ALREADY_EXISTS'] as CallableFunction)(dto.username));
      }
    }
  }
}
