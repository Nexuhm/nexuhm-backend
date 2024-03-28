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
import { UsersModule } from '../users/users.module';
import { CandidateHiringService } from './services/candidate-hiring.service';
import {
  CandidateStage,
  CandidateStageSchema,
} from './schemas/candidate-stage.schema';
import { AdminCandidateHiringController } from './controllers/candidate-hiring.controller';
import { EmailsModule } from '../emails/emails.module';

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
      {
        name: CandidateStage.name,
        useFactory: () => CandidateStageSchema,
      },
    ]),
    UsersModule,
    HttpModule,
    StorageModule,
    EmailsModule,
  ],
  exports: [MongooseModule, VideoAnalysisService, CandidateService],
  providers: [VideoAnalysisService, CandidateService, CandidateHiringService],
  controllers: [
    CandidateController,
    AdminCandidateController,
    AdminCandidateHiringController,
  ],
})
export class CandidatesModule {}
