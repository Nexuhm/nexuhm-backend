import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsLocale, IsOptional, IsString } from 'class-validator';

export class JobGenerationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isStealth: boolean;

  @ApiProperty()
  @IsLocale()
  @IsOptional()
  locale: string;
}
