import { Controller, Get, HttpStatus, UseFilters } from '@nestjs/common';
import { DebugService } from '@debug/services';
import { RestExceptionFilter } from '@api/filters';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorDto } from '@api/dto/v1';

@Controller('debug')
@UseFilters(RestExceptionFilter)
@ApiTags('Operations only for development mode')
@ApiResponse({ type: ErrorDto, description: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR })
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Get('dump-cache')
  @ApiOperation({ summary: 'Get all cache contents at the current moment' })
  @ApiResponse({ type: Object, description: 'Received cached data', status: HttpStatus.OK })
  public dumpInMemoryCache(): object {
    return this.debugService.dumpInMemoryCache();
  }
}
