import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobApplicationOptions } from '../jobs.interface';
import { EmailService } from '@/core/modules/emails/services/email.service';
import { ApplicationSuccessTemplate } from '@/core/modules/emails/templates/application-success.template';
import { VideoAnalysisService } from '@/core/modules/candidates/services/video-analysis.service';
import { AzureStorageService } from '@/core/modules/storage/services/azure-storage.service';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate } from '@/core/modules/candidates/schemas/candidate.schema';
import { Model } from 'mongoose';
import { CandidateService } from '@/core/modules/candidates/services/candidate.service';
import * as path from 'path';

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

    const getFileName = (originalName: string, newName: string) => {
      const ext = path.extname(originalName);
      return `${newName}${ext}`;
    };

    const getFilePath = (originalName: string, newName: string) => {
      const name = getFileName(originalName, newName);
      return `${filePrefix}/${name}`;
    };

    for (const fieldName in files) {
      const file = files[fieldName][0];
      const filePath = getFilePath(file.originalname, fieldName);

      const client = await this.azureStorageService.uploadBlob(
        filePath,
        file.buffer,
      );

      candidate.set(fieldName, client.url);
    }

    await candidate.save();

    const accessToken = await this.videoAnalysisService.getAccessToken();

    console.log(getFileName(files['videoResume'][0].originalname, filePrefix));

    const indexedVideoId = await this.videoAnalysisService.uploadVideo(
      accessToken,
      files.videoResume[0].buffer,
      getFileName(files['videoResume'][0].originalname, filePrefix),
    );

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
