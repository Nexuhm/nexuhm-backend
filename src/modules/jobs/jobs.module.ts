import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPosting, JobPostingSchema } from './schemas/job-posting.schema';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: JobPosting.name,
        useFactory: () => JobPostingSchema,
      },
    ]),
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
