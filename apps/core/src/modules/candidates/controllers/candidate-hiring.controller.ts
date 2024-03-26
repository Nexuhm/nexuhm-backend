import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import {
  InterviewOptionsDto,
  InterviewParamsDto,
  CreateOfferOptionsDto,
  CreateOfferParamsDto,
  CreateFeedbackOptionsDto,
  CreateFeedbackParamsDto,
  HireParamsDto,
  HireOptionsDto,
  RejectParamsDto,
} from '../dto/candidate.dto';
import { CandidateHiringService } from '../services/candidate-hiring.service';
import { MissingIntegrationException } from '@/core/lib/exception/missing-integration.exception';
import { CandidateNotFoundException } from '../exception/candidate-not-found.exception';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InterviewOptions } from '../candidate.interface';
import { addMinutes, parse } from 'date-fns';

@ApiTags('Candidates Controller')
@UseGuards(JwtAuthGuard)
@Controller('/admin/candidates')
export class AdminCandidateHiringController {
  constructor(private candidateHiringService: CandidateHiringService) {}

  @Post('/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectCandidate(@Param() { id: candidateId }: RejectParamsDto) {
    await this.candidateHiringService.reject(candidateId);
  }

  @Post('/:id/interview')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meeting scheduled with candidate successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Candidate not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "Calendar integration doesn't exist or stage doesn't allow action",
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async createMeeting(
    @Param() { id: candidateId }: InterviewParamsDto,
    @User() user: UserDocument,
    @Body() options: InterviewOptionsDto,
  ) {
    const parseDate = (str: string) => {
      const date = parse(str, 'yyyy-MM-dd HH:mm', new Date());
      return date;
    };

    const startDate = parseDate(`${options.date} ${options.startTime}`);
    const endDate = options.endTime
      ? parseDate(`${options.date} ${options.endTime}`)
      : addMinutes(startDate, 30);

    const interviewOptions: InterviewOptions = {
      location: options.location,
      message: options.message,
      interviewers: options.interviewers,
      timezone: options.timezone,
      startDate,
      endDate,
    };

    await this.candidateHiringService
      .createMeeting(user, candidateId, interviewOptions)
      .catch((e) => {
        if (e instanceof MissingIntegrationException) {
          throw new BadRequestException(e.message);
        }

        if (e instanceof CandidateNotFoundException) {
          throw new NotFoundException(e.message);
        }
      });
  }

  @Post('/:id/feedback')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback saved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Not allowed for action, invalid stage',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async createFeedback(
    @User() user: UserDocument,
    @Param() { id: candidateId }: CreateFeedbackParamsDto,
    @Body() feedback: CreateFeedbackOptionsDto,
  ) {
    await this.candidateHiringService.createFeedback(
      candidateId,
      user,
      feedback,
    );
  }

  @Post('/:id/offer')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Not allowed for action, invalid stage',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async createOffer(
    @User() user: UserDocument,
    @Param() { id: candidateId }: CreateOfferParamsDto,
    @Body() offer: CreateOfferOptionsDto,
  ) {
    await this.candidateHiringService.createOffer(candidateId, user, offer);
  }

  @Post('/:id/hire')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Not allowed for action, invalid stage',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async hire(
    @User() user: UserDocument,
    @Param() { id: candidateId }: HireParamsDto,
    @Body() hireData: HireOptionsDto,
  ) {
    await this.candidateHiringService.hireCandidate(
      candidateId,
      user,
      hireData,
    );
  }
}
