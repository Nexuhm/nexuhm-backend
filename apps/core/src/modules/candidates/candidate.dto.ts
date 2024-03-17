import {
  IsOptional,
  IsString,
  IsDate,
  IsEmail,
  IsArray,
  ArrayMinSize,
  IsTimeZone,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackOptions, ScheduleMeetingOptions } from './candidate.inerface';
import {
  RoleCompatibility,
  FeedbackImpression,
  FeedbackRecommendation,
} from './candidate.enum';

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

export class SetFeedbackParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class SetFeedbackOptionsDto implements FeedbackOptions {
  @IsEnum(FeedbackImpression)
  @ApiProperty({
    enum: FeedbackImpression,
    enumName: 'FeedbackImpression',
  })
  impression: FeedbackImpression;

  @IsString()
  @ApiProperty()
  strengthsAndWeaknesses: string;

  @IsEnum(RoleCompatibility)
  @ApiProperty({
    enum: RoleCompatibility,
    enumName: 'RoleCompatibility',
  })
  fitForTheRole: RoleCompatibility;

  @IsEnum(FeedbackRecommendation)
  @ApiProperty({
    enum: FeedbackRecommendation,
    enumName: 'FeedbackRecommendation',
  })
  recommendation: FeedbackRecommendation;
}

export class CandidateScheduleMeetingDto implements ScheduleMeetingOptions {
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
