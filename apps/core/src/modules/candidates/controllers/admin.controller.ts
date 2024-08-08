import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateNoteDto } from '../dto/create-candidtae-note.dto';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { PaginationDto } from '@/core/lib/dto/pagination.dto';
import { GetCandidatesListQueryDto } from '../dto/candidate.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';

@ApiTags('Candidates Controller')
@UseGuards(JwtAuthGuard)
@Controller('/admin/candidates')
export class AdminCandidateController {
  constructor(private candidateSevrice: CandidateService) {}

  @Get('/')
  async getCandidates(
    @User() user: UserDocument,
    @Query() { page, pageSize }: PaginationDto,
    @Query() { jobId }: GetCandidatesListQueryDto,
  ) {
    const filters = jobId ? { job: jobId } : {};
    const pageNumber = page === 0 ? 1 : page || 1;
    const limit = pageSize || 10;
    const skip = (pageNumber - 1) * limit;
    const data = await this.candidateSevrice
      .find({
        ...filters,
        company: user.company,
      })
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

  @Get('/:id/experiences')
  async getCandidateExperience(@Param('id') candidateId) {
    return this.candidateSevrice.getExperiences(candidateId);
  }

  @Get('/:id/score')
  async getScore(@Param('id') candidateId) {
    return this.candidateSevrice.getScore(candidateId);
  }

  @Get('/:id/stage')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
  })
  async getStages(@Param('id') candidateId: string) {
    return this.candidateSevrice.getStages(candidateId);
  }

  @Post('/:id/notes')
  async addCandidateNote(
    @User() user,
    @Param('id') candidateId,
    @Body() body: CreateCandidateNoteDto,
  ) {
    return this.candidateSevrice.createNote(candidateId, user, body.note);
  }
}
