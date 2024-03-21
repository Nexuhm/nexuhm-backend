import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CandidateService } from "../../../core/src/modules/candidates/services/candidate.service";
import { ApplicationProcessingState } from "../../../core/src/modules/candidates/schemas/candidate.schema";
import { VideoAnalysisService } from "../../../core/src/modules/candidates/services/video-analysis.service";

@Injectable()
export class JobApplicationScheduler {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly videoAnalysisService: VideoAnalysisService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkNewCandidates() {
    const candidates = await this.candidateService.find({
      processingState: ApplicationProcessingState.New
    })
    .select(['videoIndexId']);

    const accessToken = await this.videoAnalysisService.getAccessToken();

    const videos = await Promise.all(candidates.map(candidate => this.videoAnalysisService.getVideoIndex(accessToken, candidate.videoIndexId)));


    const processedVideosCandidateIds = videos.map((video, idx) => ({ video, candidateId: candidates[idx]._id })).filter((videoIdMapping) => videoIdMapping.video.state == 'Processed').map(videoIdMapping => videoIdMapping.candidateId);
  }
}
