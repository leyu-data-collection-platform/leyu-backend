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
  ApiQuery,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreateRejectionTypeDto,
  UpdateRejectionTypeDto,
} from '../dto/RejectionType.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { AnnotationTypeService } from '../service/AnnotationType.service';
import { AnnotationTypeSanitized } from '../sanitize';
import { PaginatedResult } from 'src/utils/paginate.util';
import { User } from 'src/auth/entities/User.entity';
import { Role } from 'src/auth/decorators/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
@Controller('/setting/annotation-type')
@ApiTags('DataSet Annotation Type')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnotationTypeController {
  constructor(private readonly annotationTypeService: AnnotationTypeService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  async create(
    @Body() dataAnnotationDto: CreateRejectionTypeDto,
    @Request() req,
  ) {
    return this.annotationTypeService.create({
      ...dataAnnotationDto,
      created_by: req.user.id,
    });
  }
  @Get('paginate')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Paginate Countries' })
  @ApiExtraModels(PaginatedResult, AnnotationTypeSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(AnnotationTypeSanitized) },
            },
          },
        },
      ],
    },
  })
  async findPaginate(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<AnnotationTypeSanitized>> {
    return this.annotationTypeService.findPaginate(paginationDto);
  }

  @Get()
  @ApiBearerAuth()
  async findAll(@Request() req) {
    const user = req.user as User;
    const data = await this.annotationTypeService.findAll({});
    return data.map((item) =>
      AnnotationTypeSanitized.from(item, user.preferred_language),
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    const data = await this.annotationTypeService.findOne({ id });
    if (!data) {
      throw new NotFoundException(`AnnotationType #${id} not found`);
    }
    return AnnotationTypeSanitized.from(data);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() rejectionTypeData: UpdateRejectionTypeDto,
    @Request() request,
  ) {
    return this.annotationTypeService.update(id, {
      ...rejectionTypeData,
      updated_by: request.user.id,
    });
  }
  // @Post('add-alternative-name/:id')
  // async addAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.annotationTypeService.addAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  // }
  // @Put('update-alternative-name/:id')
  // async updateAlternativeName(
  //   @Param('id') id: string,
  //   @Body() addLanguage: AddLanguageDto,
  //   @Request() request,
  // ) {
  //   return this.annotationTypeService.updateAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.annotationTypeService.remove(id);
  }
}
