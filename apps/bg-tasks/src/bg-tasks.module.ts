import { AzureServiceBusModule } from '@/core/lib/modules/azure-service-bus/azure-service-bus.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CandidateProcessingModule } from './modules/candidate-processing.module';

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
    CandidateProcessingModule,
  ],
  controllers: [],
  providers: [],
})
export class NexuhmBackgroundTasksModule {}
