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
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { SentryFilter } from './lib/filters/sentry.filter';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
  });

  const httpsOptions: HttpsOptions = {};

  // Enable HTTPS via use of local HTTP cert & key in the "ssl" directory
  if (process.env.USE_LOCAL_HTTPS_CERTS === 'true') {
    // Https
    const fs = require('fs');
    const sslKey = fs.readFileSync(
      __dirname + '/../../../ssl/api.nexuhm-local.com.key.pem',
    );
    const sslCert = fs.readFileSync(
      __dirname + '/../../../ssl/api.nexuhm-local.com.crt.pem',
    );

    httpsOptions.key = sslKey;
    httpsOptions.cert = sslCert;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  app.set('trust proxy', 1);
  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: [
      /^http:\/\/localhost(:\d+)?$/,
      /^https:\/\/[a-z0-9.-]+\.nexuhm-local\.com$/,
      /^https:\/\/[a-z0-9.-]+\.nexuhm\.com$/,
      /^https:\/\/nexuhm\.com$/,
    ],
    credentials: true,
  });

  // add Sentry exception filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  app.use('/debug-sentry', function (req) {
    throw new Error('Sentry error!');
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const messages = errors
          .map((error) => ({
            property: error.property,
            message: Object.keys(error.constraints || {})
              .map((key) => error.constraints?.[key])
              .join(', '),
          }))
          .reduce(
            (obj, err) => ({
              ...obj,
              [err.property]: err.message,
            }),
            {},
          );

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          fields: messages,
        });
      },
      stopAtFirstError: true,
      disableErrorMessages: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

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
