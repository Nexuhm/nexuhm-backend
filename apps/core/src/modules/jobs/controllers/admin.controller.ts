import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobGenerationDto } from '../dto/job-generation.dto';
import { JobPostingState } from '../types/job-posting-state.enum';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { UserRole } from '../../users/types/user-role.enum';

@ApiTags('Jobs Controller')
@Controller('/admin/jobs')
@UseGuards(JwtAuthGuard)
export class JobsAdminController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  @ApiOperation({ description: "Get job posting of user's company" })
  @ApiBearerAuth()
  getJobById(@User() user: UserDocument, @Param('id') id) {
    return this.jobsService
      .findOne({
        _id: id,
        company: user.company,
      })
      .populate('company', 'slug');
  }

  @Get()
  @ApiOperation({ description: "Get job posting of user's company" })
  @ApiBearerAuth()
  getJobs(@User() user: UserDocument) {
    return this.jobsService
      .find({
        company: user.company,
      })
      .populate('totalCandidates');
  }

  @Post()
  @ApiOperation({ description: 'Create job posting draft' })
  @ApiBearerAuth()
  createJobPosting(@User() user: UserDocument, @Body() body) {
    const slug = slugify(body.title, {
      strict: true,
      trim: true,
      lower: true,
    });

    const objectId = new mongoose.Types.ObjectId();

    return this.jobsService.create({
      ...body,
      _id: objectId,
      slug: `${slug}-${objectId.toString().slice(-6)}`,
      state: JobPostingState.Draft,
      company: user.company,
    });
  }

  @Post('/generate')
  @ApiOperation({
    description: 'Generate job posting based on given title and description',
  })
  @ApiBearerAuth()
  generateJobPosting(
    @Body() body: JobGenerationDto,
    @User() user: UserDocument,
  ) {
    return this.jobsService.generateJobPosting(body, user);
  }

  @Post('/:id/edit')
  @ApiOperation({ description: 'Edit job posting draft' })
  @ApiBearerAuth()
  async editJobPosting(
    @User() user: UserDocument,
    @Body() body,
    @Param('id') id: string,
  ) {
    const job = await this.jobsService.findById(id);

    if (!job?.company.equals(user.company)) {
      throw new BadRequestException();
    }

    return this.jobsService.findByIdAndUpdate(id, body, {
      new: true,
    });
  }

  @Post('/:id/state')
  @ApiOperation({ description: 'Change job posting state' })
  @ApiBearerAuth()
  changeState(@Param('id') jobId: string, @Body() body) {
    return this.jobsService.findByIdAndUpdate(
      jobId,
      { state: body.state },
      { new: true },
    );
  }
}
