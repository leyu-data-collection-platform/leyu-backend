import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { DataSetStatus } from 'src/utils/constants/DataSetStatus.constant';
// get-dataset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetDataSetDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by code', example: 'DS-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Filter by text_data_set content' })
  @IsOptional()
  @IsString()
  text_data_set?: string;

  @ApiPropertyOptional({
    description: 'Filter by dataset status',
    enum: DataSetStatus,
  })
  @IsOptional()
  @IsEnum(DataSetStatus)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by flagged status (true/false)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value); // fallback
  })
  is_flagged?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by contributor payment status (true/false)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value); // fallback
  })
  is_paid_for_contributor?: boolean;

  @ApiPropertyOptional({ description: 'Filter by rejection reason ID' })
  @IsOptional()
  @IsString()
  rejection_reason_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by reviewer payment status (true/false)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value); // fallback
  })
  is_paid_for_reviewer?: boolean;

  @ApiPropertyOptional({ description: 'Filter by test flag (true/false)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value); // fallback
  })
  is_test?: boolean;
}
export class FindReviewerDataSetDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: [
      DataSetStatus.PENDING,
      DataSetStatus.APPROVED,
      DataSetStatus.REJECTED,
      DataSetStatus.Flagged,
    ],
    required: false,
  })
  @IsEnum([
    DataSetStatus.PENDING,
    DataSetStatus.APPROVED,
    DataSetStatus.REJECTED,
    DataSetStatus.Flagged,
  ])
  @IsOptional()
  status?: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
}

export class TaskSubmissionsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by annotation' })
  @IsUUID()
  @IsOptional()
  contributor_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by dataset status',
    enum: DataSetStatus,
  })
  @IsOptional()
  @IsEnum(DataSetStatus)
  status?: DataSetStatus;
}
/* =======================
   BASE DTO
======================= */
export class DataSetItemDto {
  @ApiProperty()
  @IsUUID()
  micro_task_id: string;
  @ApiProperty()
  @IsString()
  text_data_set: string;
}

/* =======================
   CREATE SINGLE
======================= */
export class CreateDataSetDto {
  @ApiProperty()
  @IsUUID()
  micro_task_id: string;

  @ApiProperty()
  @IsString()
  text_data_set: string;
}

/* =======================
   UPDATE (partial of create)
======================= */
export class UpdateDataSetDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  micro_task_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  text_data_set?: string;
}

/* =======================
   CREATE MULTIPLE
======================= */
export class CreateMultipleDataSetDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataSetItemDto)
  items: DataSetItemDto[];
}

/* =======================
   PAGINATED QUERY
======================= */
export class FindContributorDatasetDto {
  @ApiProperty()
  @IsUUID()
  contributor_id: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit?: number;
}
