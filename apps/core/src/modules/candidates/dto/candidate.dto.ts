import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import {
  FeedbackOptions,
  HireOptions,
  OfferOptions,
  InterviewOptions,
} from '../candidate.interface';
import {
  RoleCompatibility,
  FeedbackImpression,
  FeedbackRecommendation,
} from '../candidate.enum';

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

export class CreateFeedbackParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class CreateFeedbackOptionsDto implements FeedbackOptions {
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

export class HireParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class HireOptionsDto implements HireOptions {
  @IsString()
  @ApiProperty()
  positionTitle: string;

  @IsDate()
  @ApiProperty()
  startDate: Date;

  @IsString()
  @ApiProperty()
  salary: string;
}

export class CreateOfferParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}

export class CreateOfferOptionsDto implements OfferOptions {
  @IsString()
  @ApiProperty()
  positionTitle: string;

  @IsDate()
  @ApiProperty()
  startDate: Date;

  @IsString()
  @ApiProperty()
  salary: string;

  @IsString()
  @ApiProperty()
  benefits: string;
}

export class InterviewOptionsDto implements InterviewOptions {
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

export class RejectParamsDto {
  @IsString()
  @ApiProperty()
  id: string;
}
