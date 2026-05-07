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
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiExtraModels,
  getSchemaPath,
  ApiHeaders,
} from '@nestjs/swagger';
import { OrganizationService } from '../service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../dto/Organization.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { OrganizationSanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/organization')
@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(
    @Body() organizationData: CreateOrganizationDto,
    @Request() req,
  ) {
    return this.organizationService.create({ ...organizationData });
  }
  @Get('')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiBearerAuth()
  @ApiExtraModels(PaginatedResult, OrganizationSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(OrganizationSanitized) },
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Paginate Organizations' })
  async findPaginate(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<OrganizationSanitized>> {
    const data = await this.organizationService.findPaginate(paginationDto);
    return {
      ...data,
      result: data.result.map((item) => OrganizationSanitized.from(item)),
    };
  }

  @Get('all')
  @ApiHeaders([{ name: 'accept-language', required: false }])
  async findAll(@Query() query: UpdateOrganizationDto, @Request() req) {
    const preferred_language =
      (req.headers['accept-language'] as string) || 'en';
    const organizations = await this.organizationService.findMany(query);
    return organizations.map((item) =>
      OrganizationSanitized.from(item, preferred_language),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organizationService.findOne({ id });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() organizationData: UpdateOrganizationDto,
    @Request() request,
  ) {
    return this.organizationService.update(id, { ...organizationData });
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   const organizationId = parseInt(id);
  //   return this.organizationService.addAlternativeName(
  //     organizationId,
  //     addLanguage.language_key,
  //     addLanguage.alternative_name,
  //   );
  // }

  // @Put('update-alternative-name/:id')
  // async updateAlternativeName(
  //   @Param('id',ParseIntPipe) id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   const organizationId = parseInt(id);
  //   return this.organizationService.updateAlternativeName(organizationId,addLanguage.language_key,addLanguage.alternative_name);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
