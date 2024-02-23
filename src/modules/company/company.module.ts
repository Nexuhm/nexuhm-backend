import { Module } from '@nestjs/common';
import { Company, CompanySchema } from './schemas/company.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './services/company.service';
import { OnboardingController } from './controllers/onboarding.controller';
import { CompanyController } from './controllers/company.controller';
import { CareersPage, CareersPageSchema } from './schemas/careers-page.schema';
import { CareersPageController } from './controllers/careers-page.controller';

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
    ]),
  ],
  exports: [CompanyService],
  providers: [CompanyService],
  controllers: [OnboardingController, CompanyController, CareersPageController],
})
export class CompanyModule {}
