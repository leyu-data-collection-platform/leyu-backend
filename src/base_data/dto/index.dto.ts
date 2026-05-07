import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { LanguageConstants } from 'src/utils/constants/Language.constant';

export class AlternativeNamesDto {
  @ApiProperty()
  @IsString()
  @IsEnum(LanguageConstants)
  key: string;

  @ApiProperty()
  @IsString()
  name: string;
}
