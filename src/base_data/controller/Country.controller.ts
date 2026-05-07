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
  ApiHeaders,
} from '@nestjs/swagger';
import { CountryService } from '../service/Country.service';
import {
  CreateCountryDto,
  SearchCountryDto,
  UpdateCountryDto,
} from '../dto/Country.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { CountrySanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';

@ApiTags('Country')
@ApiExtraModels(SearchCountryDto, PaginationDto)
@Controller('/setting/country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() body: CreateCountryDto, @Request() req) {
    return await this.countryService.create({
      ...body,
      created_by: req.user.id,
    });
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all Countries' })
  @ApiHeaders([{ name: 'accept-language', required: false }])
  async findAll(@Request() req): Promise<CountrySanitized[]> {
    const preferredLanguage =
      (req.headers['accept-language'] as string) || 'en';
    const countries = await this.countryService.findMany({});
    return countries.map((item) =>
      CountrySanitized.from(item, preferredLanguage),
    );
  }

  @Get('')
  @ApiBearerAuth()
  @ApiExtraModels(PaginatedResult, CountrySanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(CountrySanitized) },
            },
          },
        },
      ],
    },
  })
  @ApiOperation({ summary: 'Paginate Countries' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findPaginate(@Query() paginationDto: PaginationDto) {
    return await this.countryService.findPaginate(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Country by id' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id') id: string) {
    const country = await this.countryService.findOne({ id });
    if (!country) {
      throw new NotFoundException(`Country #${id} not found`);
    }
    return country;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Country by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
    @Request() req,
  ) {
    return await this.countryService.update(id, {
      ...updateCountryDto,
      updated_by: req.user.id,
    });
  }

  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.countryService.addAlternativeName(
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
  //   return this.countryService.updateAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Country by id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return await this.countryService.delete(id);
  }
}
