import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulerModule);
  await app.init();
}
bootstrap();
