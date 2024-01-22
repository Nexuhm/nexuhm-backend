import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { User } from '@/lib/decorators/user.decorator';
import { UserDocument } from '@/modules/users/schemas/user.schema';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JobGenerationDto } from '../dto/job-generation.dto';

@ApiTags('Jobs Controller')
@Controller('/jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ description: "Get job posting of user's company" })
  @ApiBearerAuth()
  getJobs(@User() user: UserDocument) {
    return this.jobsService.find({
      company: user.company,
    });
  }

  @Post()
  @ApiOperation({ description: "Create job posting for user's company" })
  @ApiBearerAuth()
  createJobPosting(@User() user: UserDocument, @Body() body) {
    return this.jobsService.create({
      ...body,
      company: user.company,
    });
  }

  @Post('/generate')
  @ApiOperation({
    description: 'Generate job posting based on given title and description',
  })
  @ApiBearerAuth()
  generateJobPosting(
    @User() user: UserDocument,
    @Body() body: JobGenerationDto,
  ) {
    return this.jobsService.generateJobPosting(body, user);
  }
}
