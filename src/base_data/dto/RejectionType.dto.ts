import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { LanguageConstants } from 'src/utils/constants/Language.constant';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';
export class CreateFlagTypeDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Flag type name',
    example: 'In appropriate words',
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Flag description' })
  @IsString()
  description?: string;
}

export class CreateRejectionTypeDto {
  @ApiPropertyOptional({
    description: 'Rejection type name',
    example: 'In appropriate content',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rejection description' })
  @IsString()
  description: string;
}
export class UpdateRejectionTypeDto {
  @ApiPropertyOptional({
    description: 'Rejection type name',
    example: 'In appropriate content',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Rejection description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Alternative names',
    type: [AlternativeNamesDto],
  })
  @Type(() => AlternativeNamesDto) //
  @ValidateNested({ each: true })
  @IsOptional()
  alternative_names?: AlternativeNamesDto[];
}

export class AddLanguageDto {
  @ApiPropertyOptional({
    description: 'Language key',
    example: 'en',
    enum: LanguageConstants,
  })
  @IsEnum(LanguageConstants)
  language_key: LanguageConstants;

  @ApiPropertyOptional({
    description: 'Alternative names',
    type: [AlternativeNamesDto],
  })
  @Type(() => AlternativeNamesDto) //
  @ValidateNested({ each: true })
  @IsOptional()
  alternative_names?: AlternativeNamesDto[];
}
