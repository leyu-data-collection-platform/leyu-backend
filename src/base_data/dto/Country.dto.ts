import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';

export class CreateCountryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  continent: string;
}
export class UpdateCountryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  continent?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @Type(() => AlternativeNamesDto)
  @IsOptional()
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}
export class SearchCountryDto extends UpdateCountryDto {}
