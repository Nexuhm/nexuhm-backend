import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NexuhmBackgroundTasksModule } from './bg-tasks.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NexuhmBackgroundTasksModule,
    {
      transport: Transport.TCP,
      options: {
        port: 5000,
      },
    },
  );

  await app.listen();
}

bootstrap();
