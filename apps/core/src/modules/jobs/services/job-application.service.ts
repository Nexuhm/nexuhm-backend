import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobApplicationOptions } from '../jobs.interface';
import { EmailService } from '../../emails/services/email.service';
import { ApplicationSuccessTemplate } from '../../emails/templates/application-success.template';
import { VideoAnalysisService } from '../../candidates/services/video-analysis.service';
import { AzureStorageService } from '../../storage/services/azure-storage.service';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate } from '../../candidates/schemas/candidate.schema';
import { Model } from 'mongoose';
import { CandidateService } from '../../candidates/services/candidate.service';

@Injectable()
export class JobsApplicationService {
  constructor(
    private readonly jobsService: JobsService,
    private readonly candidateService: CandidateService,
    private readonly emailServive: EmailService,
    private readonly applicationSuccessTemplate: ApplicationSuccessTemplate,
    private readonly videoAnalysisService: VideoAnalysisService,
    private readonly azureStorageService: AzureStorageService,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
  ) {}

  async createCandidate(
    jobSlug: string,
    files: Record<string, Express.Multer.File[]>,
    application: JobApplicationOptions,
  ) {
    const job = await this.jobsService.findBySlug(jobSlug).populate('company');

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const exists = await this.candidateModel.exists({
      email: application.email,
      job,
    });

    if (exists) {
      throw new BadRequestException('Candidate already applied for this job');
    }

    const candidate = await this.candidateService.create({
      firstname: application.firstname,
      lastname: application.lastname,
      email: application.email,
      job,
    });

    const suffix = candidate._id.toString().substring(0, 5);
    const filePrefix = `${candidate.firstname}-${candidate.lastname}-${suffix}`;
    const fileList = [
      {
        name: `${filePrefix}/${files['resume'][0].filename}`,
        file: files['resume'][0],
        field: 'resume',
      },
      {
        name: `${filePrefix}/${files['coverLetter'][0].filename}`,
        file: files['coverLetter'][0],
        field: 'coverLetter',
      },
      {
        name: `${filePrefix}/${files['videoResume'][0].filename}`,
        file: files['videoResume'][0],
        field: 'videoResume',
      },
    ];

    const promises = fileList.map(async ({ name, field, file }) => {
      const client = await this.azureStorageService.uploadBlob(
        name,
        file.buffer,
      );

      return {
        type: field,
        url: client.url,
      };
    });

    const fileUrls = await Promise.all(promises);

    const indexedVideoId = await this.videoAnalysisService.startVideoProcessing(
      files.videoResume[0].buffer,
      files.videoResume[0].originalname,
    );

    candidate.set('files', fileUrls);
    candidate.set('videoIndexId', indexedVideoId);
    await candidate.save();

    const result = this.applicationSuccessTemplate.render({
      logo: job?.company.logo,
      username: `${application.firstname} ${application.lastname}`,
    });

    await this.emailServive.sendEmail({
      from: 'noreply@nexuhm.com',
      content: {
        subject: 'Thank you for your Application',
        html: result.html,
      },
      recipients: {
        to: [
          {
            address: application.email,
            displayName: `${application.firstname} ${application.lastname}`,
          },
        ],
      },
    });
  }
}
