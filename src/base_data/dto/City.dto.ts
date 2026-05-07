import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';

export class UpdateCityDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @IsOptional()
  @Type(() => AlternativeNamesDto)
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}
export class CreateCityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  region_id: string;
}
export class SearchCityDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
}
