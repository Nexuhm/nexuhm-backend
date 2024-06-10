import { Module } from '@nestjs/common';
import { CandiateProcessingService } from './candidate-processing.service';
import { CandidatesModule } from '@/core/modules/candidates/candidates.module';
import { JobsModule } from '@/core/modules/jobs/jobs.module';
import { HttpModule } from '@nestjs/axios';
import { CompanyModule } from '@/core/modules/company/company.module';
import { LoggerModule } from '@/core/lib/modules/logger/logger.module';
import { FileProcessingService } from './file-processing.service';
import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      receivers: [
        'candidate-video-processing-queue',
        'candidate-resume-processing-queue',
      ],
    }),
    HttpModule,
    CandidatesModule,
    JobsModule,
    CompanyModule,
    LoggerModule.forFeature({ name: CandidateProcessingModule.name }),
  ],
  controllers: [],
  providers: [CandiateProcessingService, FileProcessingService],
})
export class CandidateProcessingModule {}
