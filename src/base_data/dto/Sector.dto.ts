import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
import { Type } from 'class-transformer';

export class CreateSectorDto {
  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  name: string;
  @ApiProperty()
  @IsOptional()
  @MaxLength(300)
  description: string;

  @ApiPropertyOptional({
    description: 'Alternative names',
    type: [AlternativeNamesDto],
  })
  @Type(() => AlternativeNamesDto) //
  @ValidateNested({ each: true })
  @IsOptional()
  alternative_names?: AlternativeNamesDto[];
}
export class UpdateSectorDto extends CreateSectorDto {}
