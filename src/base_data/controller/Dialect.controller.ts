import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
  ApiHeaders,
} from '@nestjs/swagger';
import { DialectService } from '../service/Dialect.service';
import {
  CreateDialectDto,
  GetDialectDto,
  UpdateDialectDto,
} from '../dto/Dialect.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { DialectSanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/dialect')
@ApiTags('Dialects')
export class DialectController {
  constructor(private readonly dialectService: DialectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dialect' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dialectData: CreateDialectDto, @Request() req) {
    return this.dialectService.create({
      ...dialectData,
      created_by: req.user.id,
    });
  }
  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paginate Dialects' })
  @ApiExtraModels(PaginatedResult, DialectSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(DialectSanitized) },
            },
          },
        },
      ],
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findPaginate(@Query() paginationDto: PaginationDto) {
    const data = await this.dialectService.findPaginate(
      { relations: { language: true } },
      paginationDto,
    );
    return {
      ...data,
      result: data.result.map((item) => DialectSanitized.from(item)),
    };
  }
  @Get('all')
  @ApiOperation({ summary: 'Get All dialects' })
  async findAll(@Query() query: GetDialectDto, @Request() req) {
    const dialect = await this.dialectService.findMany({});
    return dialect.map((item) => DialectSanitized.from(item, query.language));
  }
  @Get('language/:language_id')
  @ApiOperation({ summary: 'Get a dialect by ID' })
  @ApiHeaders([{ name: 'Accept-Language', required: false }])
  async findAllByLanguage(
    @Param('language_id') language_id: string,
    @Request() req,
  ) {
    const preferred_language =
      (req.headers['accept-language'] as string) || 'en';
    const dialect = await this.dialectService.findMany({ language_id });
    return dialect.map((item) =>
      DialectSanitized.from(item, preferred_language),
    );
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a dialect by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    return this.dialectService.findOne({ id });
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.dialectService.addAlternativeName(
  //     id,
  //     addLanguage.language_key,
  //     addLanguage.alternative_name,
  //   );
  // }

  // @Put('update-alternative-name/:id')
  //   async updateAlternativeName(
  //     @Param('id') id: string,
  //     @Body() addLanguage: AddLanguageDto,
  //     @Request() request,
  //   ) {
  //     return this.dialectService.updateAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  //   }
  @Put(':id')
  @ApiOperation({ summary: 'Update a dialect' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dialectData: UpdateDialectDto,
    @Request() request,
  ) {
    return this.dialectService.update(id, {
      ...dialectData,
      updated_by: request.user.id,
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a dialect' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string) {
    return this.dialectService.delete(id);
  }
}
