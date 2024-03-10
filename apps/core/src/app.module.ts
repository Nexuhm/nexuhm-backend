import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { MongooseModule } from '@nestjs/mongoose';
import { MorganLoggerMiddleware } from '@/core/lib/modules/logger/logger.middleware';
import { LoggerModule } from './lib/modules/logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { StorageModule } from './modules/storage/storage.module';
import { AccountModule } from './modules/account/account.module';
import { EmailsModule } from './modules/emails/emails.module';
import { AzureServiceBusModule } from './lib/modules/azure-service-bus/azure-service-bus.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI!),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
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
    AuthModule,
    UsersModule,
    JobsModule,
    CandidatesModule,
    StorageModule,
    AccountModule,
    EmailsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganLoggerMiddleware).forRoutes('*');
  }
}
