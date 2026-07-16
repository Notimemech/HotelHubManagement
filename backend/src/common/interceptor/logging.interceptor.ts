import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;
    const body = request.body as unknown;
    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - now;
        this.logger.log(
          `Outgoing Response: ${method} ${url} ${response.statusCode} - ${delay}ms - Body: ${JSON.stringify(data)}`,
        );
      }),
      catchError((err: Error) => {
        this.logger.error(
          `Error: ${method} ${url} - ${err.message}`,
          err.stack,
        );
        return throwError(() => err);
      }),
    );
  }
}
