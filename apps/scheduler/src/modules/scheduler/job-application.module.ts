import { Module } from '@nestjs/common';
import { JobApplicationScheduler } from './job-application.scheduler';
import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';
import { CandidatesModule } from '@/core/modules/candidates/candidates.module';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      senders: ['candidate-processing-queue'],
    }),
    CandidatesModule,
  ],
  controllers: [],
  providers: [JobApplicationScheduler],
})
export class JobApplicationModule {}
