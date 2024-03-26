import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';
import { Module } from '@nestjs/common';
import { CandiateProcessingService } from './candidate-processing.service';
import { CandidatesModule } from '@/core/modules/candidates/candidates.module';
import { JobsModule } from '@/core/modules/jobs/jobs.module';
import { HttpModule } from '@nestjs/axios';
import { CompanyModule } from '@/core/modules/company/company.module';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      receivers: ['candidate-processing-queue'],
    }),
    HttpModule,
    CandidatesModule,
    JobsModule,
    CompanyModule,
  ],
  controllers: [],
  providers: [CandiateProcessingService],
})
export class CandidateProcessingModule {}
