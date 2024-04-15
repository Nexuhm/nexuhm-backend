import 'dotenv/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import * as basicAuth from 'express-basic-auth';
import * as cookieParser from 'cookie-parser';
import { WinstonLoggerService } from './lib/modules/logger/logger.service';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { SentryFilter } from './lib/filters/sentry.filter';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(helmet());

  app.use(cookieParser());

  app.use((req: Request, res, next) => {
    console.log(req.method, req.url);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // app.enableCors({
  //   origin: true,
  //   credentials: true,
  // });

  // add Sentry exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  app.use('/debug-sentry', function (req) {
    throw new Error('Sentry error!');
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     stopAtFirstError: true,
  //     disableErrorMessages: false,
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //       exposeDefaultValues: true,
  //     },
  //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //   }),
  // );

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
