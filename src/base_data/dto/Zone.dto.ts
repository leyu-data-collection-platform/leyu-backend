import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Validate } from 'class-validator';
import { AlternativeNamesDto } from './index.dto';
export class CreateZoneDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  region_id: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @IsOptional()
  @Validate(AlternativeNamesDto)
  alternative_names?: AlternativeNamesDto[];
}
export class UpdateZoneDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  region_id?: string;

  @ApiProperty({ required: false, type: [AlternativeNamesDto] })
  @IsOptional()
  @Validate(AlternativeNamesDto)
  alternative_names?: AlternativeNamesDto[];
}
