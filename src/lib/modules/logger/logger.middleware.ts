import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from './logger.service';
import * as morgan from 'morgan';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MorganLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const format =
      this.configService.get('NODE_ENV') !== 'production' ? 'dev' : 'combined';

    const middleware = morgan(format, {
      stream: {
        write: (message: string) => {
          if (res.statusCode < 400) {
            this.logger.log(message);
          } else {
            this.logger.error(message);
          }
        },
      },
    });

    middleware(req, res, next);
  }
}
