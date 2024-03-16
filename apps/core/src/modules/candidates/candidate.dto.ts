import { IsOptional, IsString, IsDate, IsEmail, IsArray, ArrayMinSize, IsTimeZone } from 'class-validator'
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICandidateScheduleMeeting } from './candidate.inerface';
import { addMinutes } from 'date-fns';

export class GetCandidatesListQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  job?: string;
}

export class CandidateScheduleMeetingParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class CandidateScheduleMeetingDto implements ICandidateScheduleMeeting {
  @IsDate()
  @ApiProperty()
  startDate: Date;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  endDate: Date;

  @IsString()
  @IsTimeZone()
  @ApiProperty()
  timezone: string;

  @IsString({ each: true })
  @IsEmail(undefined, { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty()
  interviewers: Array<string>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  location?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  message?: string;
}