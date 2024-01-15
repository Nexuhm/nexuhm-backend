import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class OAuthCallbackInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const isOAuthCallback = this.reflector.get<boolean>(
      'oauthCallback',
      context.getHandler(),
    );

    if (!isOAuthCallback) {
      return next.handle(); // Proceed normally for non-decorated routes
    }

    return next.handle().pipe(
      map((data) => {
        const token = data?.token;
        const secret = process.env.AUTH_CALLBACK_SECRET;
        const callbackUrl = process.env.AUTH_CALLBACK_URL;

        if (!callbackUrl) {
          throw new HttpException(
            'Callback URL not configured',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return response.redirect(
          `${callbackUrl}?token=${encodeURIComponent(token)}&secret=${secret}`,
        );
      }),
    );
  }
}
