import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VideoAnalysisService } from '../services/video-analysis.service';

@Controller('/candidates')
export class CandidatesController {
  constructor(private readonly videoAnalysisService: VideoAnalysisService) {}

  @Post('/apply')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resume', maxCount: 1 },
      { name: 'coverLetter', maxCount: 1 },
      { name: 'videoResume', maxCount: 1 },
    ]),
  )
  async analyze(@UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const analysisResults = await this.videoAnalysisService.getTranscripts(
      files.videoResume[0].buffer,
      files.videoResume[0].originalname,
    );
    return analysisResults;
  }
}
