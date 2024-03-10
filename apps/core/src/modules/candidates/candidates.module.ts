import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { HttpModule } from '@nestjs/axios';
import { VideoAnalysisService } from './services/video-analysis.service';
import { StorageModule } from '../storage/storage.module';
import { CandidateController } from './controllers/candidate.controller';
import { CandidateService } from './services/candidate.service';
import {
  CandidateNote,
  CandidateNoteSchema,
} from './schemas/candidate-note.schema';
import { AdminCandidateController } from './controllers/admin.controller';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Candidate.name,
        useFactory: () => CandidateSchema,
      },
      {
        name: CandidateNote.name,
        useFactory: () => CandidateNoteSchema,
      },
    ]),
    HttpModule,
    StorageModule,
  ],
  exports: [MongooseModule, VideoAnalysisService],
  providers: [VideoAnalysisService, CandidateService],
  controllers: [CandidateController, AdminCandidateController],
})
export class CandidatesModule {}
