import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPosting, JobPostingSchema } from './schemas/job-posting.schema';
import { JobsService } from './services/jobs.service';
import { JobsAdminController } from './controllers/admin.controller';
import { JobsController } from './controllers/jobs.controller';
import { StorageModule } from '../storage/storage.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { EmailsModule } from '../emails/emails.module';
import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: JobPosting.name,
        useFactory: () => JobPostingSchema,
      },
    ]),
    AzureServiceBusModule.forFeature({
      senders: ['candidate-processing-queue'],
    }),
    StorageModule,
    CandidatesModule,
    EmailsModule,
  ],
  controllers: [JobsAdminController, JobsController],
  providers: [JobsService],
})
export class JobsModule {}
