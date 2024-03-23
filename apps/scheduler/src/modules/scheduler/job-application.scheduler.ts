import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CandidateService } from '@/core/modules/candidates/services/candidate.service';
import { ApplicationProcessingState } from '@/core/modules/candidates/schemas/candidate.schema';
import { VideoAnalysisService } from '@/core/modules/candidates/services/video-analysis.service';
import { Sender } from '@/core/lib/modules/azure-service-bus/azure-service-bus.decorator';
import { ServiceBusSender } from '@azure/service-bus';

@Injectable()
export class JobApplicationScheduler {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly videoAnalysisService: VideoAnalysisService,
    @Sender('candidate-processing-queue')
    private readonly sender: ServiceBusSender,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkNewCandidates() {
    const candidates = await this.candidateService
      .find({
        processingState: ApplicationProcessingState.New,
      })
      .select('videoIndexId');

    const accessToken = await this.videoAnalysisService.getAccessToken();

    for (const candidate of candidates) {
      const videoIndex = await this.videoAnalysisService.getVideoIndex(
        candidate.videoIndexId,
        accessToken,
      );

      if (videoIndex.state === 'Processed') {
        await this.sender.sendMessages({
          body: JSON.stringify({
            candidateId: candidate._id,
          }),
        });
      }
    }
  }
}
