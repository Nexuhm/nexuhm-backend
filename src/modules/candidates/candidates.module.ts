import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { HttpModule } from '@nestjs/axios';
import { VideoAnalysisService } from './services/video-analysis.service';
import { StorageModule } from '../storage/storage.module';
import { CandidateController } from './controllers/candidate.controller';
import { CandidateService } from './services/candidate.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Candidate.name,
        useFactory: () => CandidateSchema,
      },
    ]),
    HttpModule,
    StorageModule,
  ],
  exports: [MongooseModule, VideoAnalysisService],
  providers: [VideoAnalysisService, CandidateService],
  controllers: [CandidateController],
})
export class CandidatesModule {}
