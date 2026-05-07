import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { SectorService } from '../service';
import { CreateSectorDto, UpdateSectorDto } from '../dto/Sector.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { SectorSanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/sector')
@ApiTags('Sector')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() sectorDto: CreateSectorDto, @Request() req) {
    return this.sectorService.create(sectorDto);
  }
  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paginate Sectors' })
  @ApiExtraModels(PaginatedResult, SectorSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(SectorSanitized) },
            },
          },
        },
      ],
    },
  })
  async findPaginate(@Query() paginationDto: PaginationDto) {
    const data = await this.sectorService.findPaginate(paginationDto);
    return {
      ...data,
      result: data.result.map((item) => SectorSanitized.from(item)),
    };
  }

  @Get('all')
  @ApiResponse({
    type: [SectorSanitized],
  })
  async findAll(
    @Query() query: UpdateSectorDto,
    @Request() req,
  ): Promise<SectorSanitized[]> {
    const sectors = await this.sectorService.findMany(query);
    const user = req.user;
    return sectors.map((item) =>
      SectorSanitized.from(item, user.preferred_language),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sector = await this.sectorService.findOne({ id });
    if (!sector) {
      throw new NotFoundException(`Sector #${id} not found`);
    }
    return sector;
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() sectorData: UpdateSectorDto,
    @Request() request,
  ) {
    return this.sectorService.update(id, sectorData);
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   const sectorId = parseInt(id);
  //   return this.sectorService.addAlternativeName(
  //     sectorId,
  //     addLanguage.language_key,
  //     addLanguage.alternative_name,
  //   );
  // }

  // @Put('update-alternative-name/:id')
  // async updateAlternativeName(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   const sectorId = parseInt(id);
  //   return this.sectorService.updateAlternativeName(sectorId,addLanguage.language_key,addLanguage.alternative_name);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sectorService.delete(id);
  }
}
