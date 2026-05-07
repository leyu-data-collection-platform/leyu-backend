import {
  Controller,
  Get,
  Post,
  Body,
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
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { RemoveContributorFromFacilitatorDto } from '../dto/UserTask.dto';
import { FacilitatorContributorService } from '../service/FacilitatorContributor.service';
import { GetFacilitatorContributorsFilterDto } from 'src/auth/dto/User.dto';
import { DataSource } from 'typeorm';
import { PaginatedResult } from 'src/utils/paginate.util';
import { FindFacilitatorContributorsDto } from '../dto/Task.dto';
import { UserSanitize } from 'src/auth/sanitize';
@Controller('/project-mgmt/task/facilitator')
@ApiTags('Facilitator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacilitatorController {
  constructor(
    private readonly facilitatorContributorService: FacilitatorContributorService,
    private readonly dataSource: DataSource,
  ) {}

  @Get('unassigned-contributors/:task_id')
  @ApiOperation({ summary: 'Get unassigned contributors' })
  @ApiExtraModels(PaginatedResult, UserSanitize)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(UserSanitize) },
            },
          },
        },
      ],
    },
  })
  @Roles(Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  async getUnassignedContributors(
    @Param('task_id') task_id: string,
    @Query() searchSchema: GetFacilitatorContributorsFilterDto,
  ): Promise<PaginatedResult<UserSanitize>> {
    const search: string | undefined = searchSchema.search;
    return await this.facilitatorContributorService.getUnassignedContributors(
      task_id,
      searchSchema,
    );
  }

  @Delete('remove-contributors/:facilitator_id')
  @ApiOperation({ summary: 'Remove contributors from facilitator' })
  @Roles(Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  async removeContributorFromFacilitator(
    @Param('facilitator_id') facilitator_id: string,
    @Body() taskTypeData: RemoveContributorFromFacilitatorDto,
    @Request() req,
  ) {
    return this.facilitatorContributorService.removeContributorsFromFacilitator(
      taskTypeData.task_id,
      facilitator_id,
      taskTypeData.contributor_ids,
    );
  }

  @Get('/contributors/:task_id')
  @ApiOperation({ summary: 'Get contributors for a task ' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'facilitator_id', required: true, type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER, Role.SUPER_ADMIN)
  async findTaskFacilitatorContributors(
    @Param('task_id') task_id: string,
    @Query() facilitatorDto: FindFacilitatorContributorsDto,
    @Request() req,
  ) {
    const user_id = req.user.id;
    return this.facilitatorContributorService.findFacilitatorContributorsByTaskId(
      task_id,
      facilitatorDto.facilitator_id,
      { ...facilitatorDto },
    );
  }

  @Get('my-assigned_contributors/:task_id')
  @ApiOperation({ summary: 'Get my assigned contributors for a task ' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FACILITATOR)
  async findMyTaskFacilitatorContributors(
    @Param('task_id') task_id: string,
    @Query() paginateDto: PaginationDto,
    @Request() req,
  ): Promise<PaginatedResult<UserSanitize>> {
    const user_id = req.user.id;
    const data =
      await this.facilitatorContributorService.findFacilitatorContributorsByTaskId(
        task_id,
        user_id,
        paginateDto,
      );
    return {
      ...data,
      result: data.result.map((item) => UserSanitize.from(item)),
    };
  }

  @Post('/:task_id/automatic-assign-contributor-to-facilitator')
  @Roles(Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  async assingContributorToFacilitatorAutomatic(
    @Param('task_id') task_id: string,
    @Request() req,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userTask =
        await this.facilitatorContributorService.assignContributorsAutomatically(
          task_id,
          queryRunner,
        );
      await queryRunner.commitTransaction();
      return userTask;
    } catch (error) {
      if (queryRunner) await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }
}
