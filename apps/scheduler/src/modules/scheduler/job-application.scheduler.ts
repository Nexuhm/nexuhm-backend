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
    @Sender('candidate-video-processing-queue')
    private readonly videoQueueSender: ServiceBusSender,
    @Sender('candidate-resume-processing-queue')
    private readonly resumeQueueSender: ServiceBusSender,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkPendingResumes() {
    const candidates = await this.candidateService.find({
      processingState: ApplicationProcessingState.New,
    });

    for (const candidate of candidates) {
      await this.resumeQueueSender.sendMessages({
        body: JSON.stringify({
          candidateId: candidate._id,
        }),
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingVideos() {
    try {
      const candidates = await this.candidateService.find({
        processingState: ApplicationProcessingState.ResumeProcessed,
      });

      const accessToken = await this.videoAnalysisService.getAccessToken();

      for (const candidate of candidates) {
        try {
          const videoIndex = await this.videoAnalysisService.getVideoIndex(
            candidate.videoIndexId,
            accessToken,
          );

          if (videoIndex.state === 'Processed') {
            await this.videoQueueSender.sendMessages({
              body: JSON.stringify({
                candidateId: candidate._id,
              }),
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
