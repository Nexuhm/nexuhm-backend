import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';
import { Module } from '@nestjs/common';
import { CandiateProcessingService } from './candidate-processing.service';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      receivers: ['candidate-processing-queue'],
    }),
  ],
  controllers: [],
  providers: [CandiateProcessingService],
})
export class CandidateProcessingModule {}
