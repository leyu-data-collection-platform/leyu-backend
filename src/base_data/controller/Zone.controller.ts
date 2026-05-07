import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiExtraModels,
  getSchemaPath,
  ApiHeaders,
} from '@nestjs/swagger';
import { ZoneService } from '../service/Zone.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/Zone.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { PaginatedResult } from 'src/utils/paginate.util';
import { ZoneSanitized } from '../sanitize';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/zone')
@ApiTags('Zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The zone has been successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() createZoneDto: CreateZoneDto, @Request() req) {
    return await this.zoneService.create({
      ...createZoneDto,
      created_by: req.user.id,
    });
  }
  @Get('')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Paginate Countries' })
  @ApiExtraModels(PaginatedResult, ZoneSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(ZoneSanitized) },
            },
          },
        },
      ],
    },
  })
  async findPaginate(@Query() paginationDto: PaginationDto) {
    return await this.zoneService.findPaginate(
      { relations: { region: true } },
      paginationDto,
    );
  }

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Returns a list of zones.',
    type: [ZoneSanitized],
  })
  @ApiHeaders([{ name: 'accept-language', required: false }])
  async findAll(
    @Query() searchDto: UpdateZoneDto,
    @Request() req,
  ): Promise<ZoneSanitized[]> {
    const zone = await this.zoneService.findAll(searchDto);
    const preferredLanguage =
      (req.headers['accept-language'] as string) || 'en';
    return zone.map((item) => ZoneSanitized.from(item, preferredLanguage));
  }

  @Get('/region/:id')
  @ApiOperation({ summary: 'Get a region by id' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of zones.',
    type: [ZoneSanitized],
  })
  async findRegionZones(@Param('id') id: string) {
    const region_id = id;
    const zones = await this.zoneService.findAll({ region_id });
    return zones.map((item) => ZoneSanitized.from(item));
  }
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Returns the specified zone.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    const zone = await this.zoneService.findOne({ id });
    if (!zone) {
      throw new NotFoundException(`Zone #${id} not found`);
    }
    return zone;
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'The zone has been successfully updated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateZoneDto: UpdateZoneDto,
    @Request() request,
  ) {
    return await this.zoneService.update(id, {
      ...updateZoneDto,
      updated_by: request.user.id,
    });
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.zoneService.addAlternativeName(
  //     id,
  //     addLanguage.language_key,
  //     addLanguage.alternative_name,
  //   );
  // }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({
    status: 204,
    description: 'The zone has been successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    return await this.zoneService.remove(id);
  }
}
