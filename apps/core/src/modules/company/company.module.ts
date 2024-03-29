import { Module } from '@nestjs/common';
import { Company, CompanySchema } from './schemas/company.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './services/company.service';
import { OnboardingController } from './controllers/onboarding.controller';
import { CompanyAdminController } from './controllers/admin.controller';
import { CareersPage, CareersPageSchema } from './schemas/careers-page.schema';
import { CompanyController } from './controllers/company.controller';
import {
  JobPosting,
  JobPostingSchema,
} from '../jobs/schemas/job-posting.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Company.name,
        useFactory: () => CompanySchema,
      },
      {
        name: CareersPage.name,
        useFactory: () => CareersPageSchema,
      },
      {
        name: JobPosting.name,
        useFactory: () => JobPostingSchema,
      },
    ]),
  ],
  exports: [MongooseModule, CompanyService],
  providers: [CompanyService],
  controllers: [
    OnboardingController,
    CompanyAdminController,
    CompanyController,
  ],
})
export class CompanyModule {}
