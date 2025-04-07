import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@persistence/lib';
import { UserCreateDto, UserDto } from '@persistence/dto/user';
import { UserMapper } from '@persistence/mappers';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserPersistenceService {
  private readonly logger: Logger = new Logger(UserPersistenceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper
  ) {}

  public async findById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID: ${id} was not found`);
    }

    return this.userMapper.toDto(user);
  }

  public async findByIdStrict(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      return null;
    }

    return user;
  }

  public async create(dto: UserCreateDto): Promise<UserDto> {
    this.logger.log(`create: ${dto.toString()}`);

    await this.checkUniqueUser(dto);

    const input = await this.userMapper.create(dto);

    const createdUser = await this.prisma.user.create({ data: input });

    return this.userMapper.toDto(createdUser);
  }

  public async signIn(username: string, password: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Wrong message or password');
    }

    const isPasswordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Wrong message or password');
    }

    return user;
  }

  public async countAll(): Promise<number> {
    return (await this.prisma.user.count()) as number;
  }

  private async checkUniqueUser(dto: UserCreateDto): Promise<void> {
    const entity = await this.prisma.user.findFirst({ where: { username: dto.username } });

    if (entity) {
      this.logger.warn(`User with username: ${dto.username} is already exists`);
      throw new BadRequestException(`User with username: ${dto.username} is already exists`);
    }
  }
}
