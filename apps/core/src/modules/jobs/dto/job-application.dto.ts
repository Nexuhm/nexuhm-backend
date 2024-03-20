import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { JobApplicationOptions } from '../jobs.interface';

export class CreateCandidateParamsDto {
  @IsString()
  @ApiProperty()
  slug: string;
}

export class JobApplicationOptionsDto implements JobApplicationOptions {
  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  firstname: string;

  @IsString()
  @ApiProperty()
  lastname: string;

  @IsString()
  @ApiProperty()
  location: string;
}
