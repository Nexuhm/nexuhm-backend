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
import { VideoAnalysisService } from '@/core/modules/candidates/services/video-analysis.service';
import { Model } from 'mongoose';
import { Candidate } from '@/core/modules/candidates/schemas/candidate.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AzureStorageService } from '@/core/modules/storage/services/azure-storage.service';
import { JobApplicationDto } from '../dto/job-application.dto';
import { EmailService } from '@/core/modules/emails/services/email.service';
import { ApplicationSuccessTemplate } from '@/core/modules/emails/templates/application-success.template';
import { Sender } from '@/core/lib/modules/azure-service-bus/azure-service-bus.decorator';
import { ServiceBusSender } from '@azure/service-bus';

@ApiTags('Jobs Controller')
@Controller('/jobs')
export class JobsController {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private readonly videoAnalysisService: VideoAnalysisService,
    private readonly azureStorageService: AzureStorageService,
    private readonly jobsService: JobsService,
    private readonly emailServive: EmailService,
    private readonly applicationSuccessTemplate: ApplicationSuccessTemplate,
    @Sender('candidate-processing-queue')
    private readonly sender: ServiceBusSender,
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
    @Param('slug') slug,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() body: JobApplicationDto,
  ) {
    await this.sender.sendMessages({
      body: JSON.stringify(body),
    });

    // const job = await this.jobsService.findBySlug(slug).populate('company');

    // const exists = await this.candidateModel.exists({
    //   email: body.email,
    //   job,
    // });

    // if (exists) {
    //   throw new BadRequestException('Candidate already applied for this job');
    // }

    // const candidate = await this.candidateModel.create({
    //   firstname: body.firstname,
    //   lastname: body.lastname,
    //   email: body.email,
    //   job,
    // });

    // const suffix = candidate._id.toString().substring(0, 5);
    // const filePrefix = `${candidate.firstname}-${candidate.lastname}-${suffix}`;
    // const fileList = [
    //   {
    //     name: `${filePrefix}/${files['resume'][0].filename}`,
    //     file: files['resume'][0],
    //     field: 'resume',
    //   },
    //   {
    //     name: `${filePrefix}/${files['coverLetter'][0].filename}`,
    //     file: files['coverLetter'][0],
    //     field: 'coverLetter',
    //   },
    //   {
    //     name: `${filePrefix}/${files['videoResume'][0].filename}`,
    //     file: files['videoResume'][0],
    //     field: 'videoResume',
    //   },
    // ];

    // const promises = fileList.map(async ({ name, field, file }) => {
    //   const client = await this.azureStorageService.uploadBlob(
    //     name,
    //     file.buffer,
    //   );

    //   return {
    //     type: field,
    //     url: client.url,
    //   };
    // });

    // const fileUrls = await Promise.all(promises);
    // candidate.set('files', fileUrls);
    // await candidate.save();

    // this.videoAnalysisService.startVideoProcessing(
    //   files.videoResume[0].buffer,
    //   files.videoResume[0].originalname,
    // );

    // const result = this.applicationSuccessTemplate.render({
    //   logo: job?.company.logo,
    //   username: `${body.firstname} ${body.lastname}`,
    // });

    // await this.emailServive.sendEmail({
    //   from: 'noreply@nexuhm.com',
    //   content: {
    //     subject: 'Thank you for your Application',
    //     html: result.html,
    //   },
    //   recipients: {
    //     to: [
    //       {
    //         address: body.email,
    //         displayName: `${body.firstname} ${body.lastname}`,
    //       },
    //     ],
    //   },
    // });

    return true;
  }
}
