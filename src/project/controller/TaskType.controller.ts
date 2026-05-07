import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { TaskTypeService } from '../service/TaskType.service';

@Controller('/project-mgmt/task-type')
@ApiTags('TaskType')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPaginate(@Query() paginateDto: PaginationDto, @Request() req) {
    return this.taskTypeService.findPaginate({}, paginateDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(@Request() req) {
    return this.taskTypeService.findAll({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.taskTypeService.findOne({ where: { id } });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    return this.taskTypeService.remove(id);
  }
}
