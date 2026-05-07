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
} from '@nestjs/swagger';
import { RejectionTypeService } from '../service/RejectionType.service';
import {
  CreateRejectionTypeDto,
  UpdateRejectionTypeDto,
} from '../dto/RejectionType.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { PaginatedResult } from 'src/utils/paginate.util';
import { RejectionTypeSanitized } from '../sanitize';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
@Controller('/setting/rejection-type')
@ApiTags('Rejection Type')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RejectionTypeController {
  constructor(private readonly rejectionTypeService: RejectionTypeService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(
    @Body() rejectionTypeData: CreateRejectionTypeDto,
    @Request() req,
  ) {
    return this.rejectionTypeService.create({
      ...rejectionTypeData,
      created_by: req.user.id,
    });
  }
  @Get('paginate')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Paginate Countries' })
  @ApiExtraModels(PaginatedResult, RejectionTypeSanitized)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(RejectionTypeSanitized) },
            },
          },
        },
      ],
    },
  })
  async findPaginate(@Query() paginationDto: PaginationDto) {
    const data = await this.rejectionTypeService.findPaginate(paginationDto);
    return data;
  }

  @Get()
  @ApiResponse({
    type: [RejectionTypeSanitized],
  })
  async findAll(@Request() req) {
    const data = await this.rejectionTypeService.findAll({});
    const user = req.user;
    return data.map((item) =>
      RejectionTypeSanitized.from(item, user.preferred_language),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rejectionTypeService.findOne({ id });
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() rejectionTypeData: UpdateRejectionTypeDto,
    @Request() request,
  ) {
    return this.rejectionTypeService.update(id, {
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
  //   return this.rejectionTypeService.addAlternativeName(
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
  //   return this.rejectionTypeService.updateAlternativeName(id,addLanguage.language_key,addLanguage.alternative_name);
  // }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    return this.rejectionTypeService.remove(id);
  }
}
