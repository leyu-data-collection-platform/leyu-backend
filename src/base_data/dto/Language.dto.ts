import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';
export class CreateLanguageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  code?: string;
}

export class UpdateLanguageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @Type(() => AlternativeNamesDto)
  @IsOptional()
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}
