import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AzureServiceBusModule } from '../../core/src/lib/modules/azure-service-bus/azure-service-bus.module';
import { JobApplicationModule } from './modules/scheduler/job-application.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AzureServiceBusModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          connectionString: configService.get(
            'AZURE_SERVICE_BUS_CONNECTION_STRING',
          ) as string,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    ScheduleModule.forRoot(),
    JobApplicationModule,
  ],
  controllers: [],
  providers: [],
})
export class SchedulerModule {}
