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
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
  ApiHeaders,
} from '@nestjs/swagger';
import { LanguageService } from '../service/Language.service';
import { CreateLanguageDto, UpdateLanguageDto } from '../dto/Language.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { LanguageSanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/language')
@ApiTags('Language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() languageData: CreateLanguageDto, @Request() req) {
    return this.languageService.create({
      ...languageData,
      created_by: req.user.id,
    });
  }
  @Get('')
  @ApiBearerAuth()
  @ApiExtraModels(PaginatedResult, LanguageSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(LanguageSanitized) },
            },
          },
        },
      ],
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findPaginate(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<LanguageSanitized>> {
    const data = await this.languageService.findPaginate(paginationDto);
    return {
      ...data,
      result: data.result.map((item) => LanguageSanitized.from(item)),
    };
  }

  @Get('all')
  @ApiHeaders([{ name: 'accept-language', required: false }])
  async findAll(
    @Query() query: UpdateLanguageDto,
    @Request() req,
  ): Promise<LanguageSanitized[]> {
    const data = await this.languageService.findMany(query);
    // get language from the header
    const preferred_language =
      (req.headers['accept-language'] as string) || 'en';
    return data.map((item) => LanguageSanitized.from(item, preferred_language));
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: LanguageSanitized })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    const language = await this.languageService.findOne({ id });
    if (!language) {
      throw new NotFoundException(`Language #${id} not found`);
    }
    return LanguageSanitized.from(language);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() languageData: UpdateLanguageDto,
    @Request() request,
  ) {
    return this.languageService.update(id, {
      ...languageData,
      updated_by: request.user.id,
    });
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.languageService.addAlternativeName(
  //     id,
  //     addLanguage.language_key,
  //     addLanguage.alternative_name,
  //   );
  // }

  // @Put('update-alternative-name/:id')
  // async updateAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.languageService.updateAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  // }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.languageService.delete(id);
  }
}
