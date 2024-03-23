import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateProcessingModule } from './modules/candidate-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
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
    CandidateProcessingModule,
  ],
  controllers: [],
  providers: [],
})
export class NexuhmBackgroundTasksModule {}
