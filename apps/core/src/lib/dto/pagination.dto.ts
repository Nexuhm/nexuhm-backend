import { PaginationOptions } from '../interface/pagination.interface';
import { IsInt, Max, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto implements PaginationOptions {
  @IsInt()
  @Max(50)
  @IsOptional()
  @ApiPropertyOptional({
    maximum: 50,
    default: 15,
  })
  limit: number = 15;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  skip: number = 0;
}
