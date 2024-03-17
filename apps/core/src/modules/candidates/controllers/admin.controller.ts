import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateNoteDto } from '../dto/create-candidtae-note.dto';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserDocument } from '../../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserIntegration } from '../../users/schemas/user-integration.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../../../lib/common/dto/pagination.dto';
import { CandidateScheduleMeetingDto, CandidateScheduleMeetingParamsDto, GetCandidatesListQueryDto } from '../candidate.dto';
import { CandidateHiringService } from '../services/candidate-hiring.service';
import { MissingIntegrationException } from '../../../lib/common/exception/missing-integration.exception';
import { CandidateNotFoundException } from '../exception/candidate-not-found.exception';
import { ApiResponse } from '@nestjs/swagger';
import { addMinutes } from 'date-fns';

@UseGuards(JwtAuthGuard)
@Controller('/admin/candidates')
export class AdminCandidateController {
  constructor(
    private candidateSevrice: CandidateService,
    @InjectModel(UserIntegration.name)
    private integrationModel: Model<UserIntegration>,
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
  async rejectCandidate(@Param('id') candidateId) {
    return this.candidateSevrice.rejectCandidate(candidateId);
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
    description: 'Integration with google or microsoft does not exist'
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.OK)
  async scheduleMeeting(@Param() { id: candidateId }: CandidateScheduleMeetingParamsDto, @User() user: UserDocument, @Body() schedule: CandidateScheduleMeetingDto) {
    try {
      await this.candidateHiringService.scheduleMeetingWithCandidate(user, candidateId, {
        ...schedule,
        endDate: schedule.endDate || addMinutes(schedule.endDate, 30)
      });
    } catch (e) {
      if (e instanceof MissingIntegrationException) throw new BadRequestException(e.message);

      if (e instanceof CandidateNotFoundException) throw new NotFoundException(e.message);

      throw e;
    }
  }
}
