import { Module } from '@nestjs/common';
import { Company, CompanySchema } from './schemas/company.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './services/company.service';
import { OnboardingController } from './controllers/onboarding.controller';
import { CompanyController } from './controllers/company.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Company.name,
        useFactory: () => CompanySchema,
      },
    ]),
  ],
  exports: [CompanyService],
  providers: [CompanyService],
  controllers: [OnboardingController, CompanyController],
})
export class CompanyModule {}
