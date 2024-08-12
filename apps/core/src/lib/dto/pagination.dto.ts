import { PaginationOptions } from '../interface/pagination.interface';
import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto implements PaginationOptions {
  @ApiPropertyOptional({
    default: 1,
  })
  @IsInt()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    default: 10,
  })
  @IsInt()
  @IsOptional()
  pageSize?: number | undefined;
}
