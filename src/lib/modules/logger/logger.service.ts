import {
  Inject,
  Injectable,
  LoggerService,
  Optional,
  Scope,
} from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import 'winston-daily-rotate-file';

export interface LoggerServiceOptions {
  name: string;
}

export const WINSTON_LOGGER_OPTIONS = 'WINSTON_LOGGER_OPTIONS';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private logger: Logger;

  constructor(
    @Optional()
    @Inject(WINSTON_LOGGER_OPTIONS)
    private options?: LoggerServiceOptions,
  ) {
    const name = this.options?.name || 'app';

    const getLogRotateOptions = () => {
      return {
        filename: `${name}-%DATE%.log`,
        dirname: './logs',
        auditFile: `./logs/audit/${name}.json`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20mb',
        maxFiles: '10d',
        format: format.combine(format.timestamp(), format.json()),
      };
    };

    this.logger = createLogger({
      transports: [
        new transports.Console({
          handleExceptions: true,
          format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD hh:mm:ss',
            }),
            format.printf(
              ({ message, level, timestamp }) =>
                `[${timestamp}] ${level.toUpperCase()} ${
                  typeof message === 'object'
                    ? JSON.stringify(message, null, 2)
                    : message
                }`,
            ),
            format.colorize({ all: true }),
          ),
        }),
        new transports.DailyRotateFile(getLogRotateOptions()),
      ],
    });
  }

  /**
   * Write a 'log' level log.
   */
  log(args) {
    this.logger.info(args);
  }

  /**
   * Write an 'error' level log.
   */
  error(...args: any) {
    this.logger.error(
      args
        .map((a) => {
          if (a instanceof Error) {
            return a.stack;
          }

          return typeof a === 'object' ? JSON.stringify(a, null, 2) : a;
        })
        .join(' '),
    );
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any) {
    this.logger.warn(message);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any) {
    this.logger.verbose(message);
  }
}
