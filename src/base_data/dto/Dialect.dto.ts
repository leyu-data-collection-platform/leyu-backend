import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { LanguageConstants } from 'src/utils/constants/Language.constant';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';

export class CreateDialectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;
  @ApiProperty()
  @IsUUID()
  language_id: string;
}
export class UpdateDialectDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @Type(() => AlternativeNamesDto)
  @IsOptional()
  @ValidateNested({ each: true })
  alternative_names?: AlternativeNamesDto[];
}

export class GetDialectDto {
  @ApiProperty({ required: false, enum: LanguageConstants })
  @IsOptional()
  @IsEnum(LanguageConstants)
  language?: string;
}
