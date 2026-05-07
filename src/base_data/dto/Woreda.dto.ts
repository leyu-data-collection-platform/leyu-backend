import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWoredaDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  zone_id: string;
}
export class UpdateWoredaDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  zone_id?: string;
}
