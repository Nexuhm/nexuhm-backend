import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
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

@UseGuards(JwtAuthGuard)
@Controller('/admin/candidates')
export class AdminCandidateController {
  constructor(private candidateSevrice: CandidateService) {}

  @Get('/')
  async getCandidates(
    @Query('limit', new DefaultValuePipe(15), new ParseIntPipe()) limit: number,
    @Query('skip', new DefaultValuePipe(0), new ParseIntPipe()) skip: number,
    @Query('job') job?: string,
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
}
