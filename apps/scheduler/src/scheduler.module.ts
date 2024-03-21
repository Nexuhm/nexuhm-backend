import { Module } from '@nestjs/common';
import { JobApplicationScheduler } from './schedulers/job-application.scheduler';
import { ScheduleModule } from '@nestjs/schedule';
import { CandidatesModule } from '../../core/src/modules/candidates/candidates.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    ScheduleModule.forRoot(),
    CandidatesModule,
  ],
  controllers: [],
  providers: [JobApplicationScheduler],
})
export class SchedulerModule {}
