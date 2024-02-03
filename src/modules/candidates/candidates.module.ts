import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { HttpModule } from '@nestjs/axios';
import { CandidatesController } from './controllers/candidates.controller';
import { VideoAnalysisService } from './services/video-analysis.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Candidate.name,
        useFactory: () => CandidateSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [CandidatesController],
  providers: [VideoAnalysisService],
})
export class CandidatesModule {}
