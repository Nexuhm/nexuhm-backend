import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './exception.filter';
import {
  LoggerServiceOptions,
  WinstonLoggerService,
  WINSTON_LOGGER_OPTIONS,
} from './logger.service';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        WinstonLoggerService,
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
      exports: [WinstonLoggerService],
    };
  }

  static forFeature(options: LoggerServiceOptions) {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: WINSTON_LOGGER_OPTIONS,
          useValue: options,
        },
        WinstonLoggerService,
      ],
      exports: [WinstonLoggerService],
    };
  }
}
