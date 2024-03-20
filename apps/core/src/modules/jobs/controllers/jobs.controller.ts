import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  CreateCandidateParamsDto,
  JobApplicationOptionsDto,
} from '../dto/job-application.dto';
import { JobsApplicationService } from '../services/job-application.service';

@ApiTags('Jobs Controller')
@Controller('/jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobApplicationService: JobsApplicationService,
  ) {}

  @Get('/:slug')
  @ApiOperation({ description: 'Get job posting details' })
  getJobs(@Param('slug') slug) {
    return this.jobsService.findBySlug(slug);
  }

  @Post('/:slug/apply')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'coverLetter', maxCount: 1 },
      { name: 'videoResume', maxCount: 1 },
    ]),
  )
  async createCandidate(
    @Param() { slug }: CreateCandidateParamsDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() application: JobApplicationOptionsDto,
  ) {
    await this.jobApplicationService.createCandidate(slug, files, application);

    return true;
  }
}
