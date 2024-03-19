import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateNoteDto } from '../dto/create-candidtae-note.dto';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '../../users/schemas/user.schema';
import { PaginationDto } from '@/core/lib/dto/pagination.dto';
import {
  InterviewOptionsDto,
  CandidateScheduleMeetingParamsDto,
  GetCandidatesListQueryDto,
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
import { addMinutes } from 'date-fns';

@ApiTags('Candidates Controller')
@UseGuards(JwtAuthGuard)
@Controller('/admin/candidates')
export class AdminCandidateController {
  constructor(
    private candidateSevrice: CandidateService,
    private candidateHiringService: CandidateHiringService,
  ) {}

  @Get('/')
  async getCandidates(
    @Query() { limit, skip }: PaginationDto,
    @Query() { job }: GetCandidatesListQueryDto,
  ) {
    const filters = job ? { job } : {};

    const data = await this.candidateSevrice
      .find(filters)
      .limit(limit)
      .skip(skip)
      .populate('job', 'title')
      .populate('lastNote');

    const totalCount = await this.candidateSevrice.count(filters);

    return {
      data,
      totalCount,
    };
  }

  @Get('/:id')
  async getCandidate(@Param('id') candidateId) {
    return this.candidateSevrice.findById(candidateId);
  }

  @Get('/:id/notes')
  async getCandidateNotes(@Param('id') candidateId) {
    return this.candidateSevrice.getNotes(candidateId);
  }

  @Post('/:id/notes')
  async addCandidateNote(
    @User() user,
    @Param('id') candidateId,
    @Body() body: CreateCandidateNoteDto,
  ) {
    return this.candidateSevrice.createNote(candidateId, user, body.note);
  }

  @Post('/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectCandidate(@Param() { id: candidateId }: RejectParamsDto ) {
    await this.candidateHiringService.reject(candidateId);
  }

  @Post('/:id/schedule')
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
    description: 'Integration with google/microsoft does not exist or candidate stage does not allow action',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async createMeeting(
    @Param() { id: candidateId }: CandidateScheduleMeetingParamsDto,
    @User() user: UserDocument,
    @Body() interview: InterviewOptionsDto,
  ) {
    try {
      await this.candidateHiringService.createMeeting(
        user,
        candidateId,
        {
          ...interview,
          endDate: interview.endDate || addMinutes(interview.endDate, 30),
        },
      );
    } catch (e) {
      if (e instanceof MissingIntegrationException) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof CandidateNotFoundException) {
        throw new NotFoundException(e.message);
      }

      throw e;
    }
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
    @Param() { id: candidateId }: CreateFeedbackParamsDto,
    @Body() feedback: CreateFeedbackOptionsDto,
  ) {
    await this.candidateHiringService.createFeedback(candidateId, feedback);
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
    @Param() { id: candidateId }: CreateOfferParamsDto,
    @Body() offer: CreateOfferOptionsDto,
  ) {
    await this.candidateHiringService.createOffer(candidateId, offer);
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
    @Param() { id: candidateId }: HireParamsDto,
    @Body() hireData: HireOptionsDto,
  ) {
    await this.candidateHiringService.hireCandidate(candidateId, hireData);
  }
}
