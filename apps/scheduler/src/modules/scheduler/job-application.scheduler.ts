import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CandidateService } from '../../../../core/src/modules/candidates/services/candidate.service';
import { ApplicationProcessingState } from '../../../../core/src/modules/candidates/schemas/candidate.schema';
import { VideoAnalysisService } from '../../../../core/src/modules/candidates/services/video-analysis.service';
import { Sender } from '../../../../core/src/lib/modules/azure-service-bus/azure-service-bus.decorator';
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
      .select(['videoIndexId']);

    const videos = await Promise.all(
      candidates.map((candidate) =>
        this.videoAnalysisService.getVideoIndex(candidate.videoIndexId),
      ),
    );

    const processedVideosCandidateIds = videos
      .map((video, idx) => ({ video, candidateId: candidates[idx]._id }))
      .filter((videoIdMapping) => videoIdMapping.video.state == 'Processed')
      .map((videoIdMapping) => videoIdMapping.candidateId);

    if (processedVideosCandidateIds.length) {
      await this.sender.sendMessages(
        processedVideosCandidateIds.map((candidateId) => ({
          body: JSON.stringify({ candidateId }),
        })),
      );
      await this.candidateService.update(
        {
          _id: {
            $in: processedVideosCandidateIds,
          },
        },
        {
          processingState: ApplicationProcessingState.Processing,
        },
      );
    }
  }
}
