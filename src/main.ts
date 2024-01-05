import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';
import * as cookieParser from 'cookie-parser';

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
  });

  // use basic auth for Swagger UI
  app.use(
    ['/api', '/api-json'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nexuhm API')
    .setDescription('The Nexuhm API endpoints')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port, '0.0.0.0', () => {
    console.log(`Listeining on port ${port}`);
  });
}

bootstrap();
