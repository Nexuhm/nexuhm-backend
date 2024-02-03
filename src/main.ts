import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';
import * as cookieParser from 'cookie-parser';
import { WinstonLoggerService } from './lib/modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: [
      /^http:\/\/localhost(:\d+)?$/,
      /^https:\/\/[a-z0-9.-]+\.nexuhm\.com$/,
    ],
    credentials: true,
  });

  // use basic auth for Swagger UI
  app.use(
    ['/api', '/api-json'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USERNAME!]: process.env.SWAGGER_PASSWORD as string,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nexuhm API')
    .setDescription('The Nexuhm API endpoints')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  const logger = await app.resolve(WinstonLoggerService);

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Nest application is listeining on port ${port}`);
  });
}

bootstrap();
