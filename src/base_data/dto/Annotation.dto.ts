import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';
export class CreateAnnotationDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  annotation_type_id: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @IsOptional()
  @Type(() => AlternativeNamesDto)
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}

export class CreateAnnotationTypeDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @IsOptional()
  @Type(() => AlternativeNamesDto) //
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}
