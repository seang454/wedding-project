import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RealtimeService } from './realtime.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class MutationEventsInterceptor implements NestInterceptor {
  constructor(private readonly realtimeService: RealtimeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = String(request?.method || '').toUpperCase();

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const rawUrl = String(request?.url || '');
    const cleanPath = rawUrl.split('?')[0].replace(/^\/api\/?/, '');
    const resource = cleanPath.split('/')[0] || 'unknown';

    // Skip auth/storage helper endpoints that do not mutate domain data
    if (resource === 'auth' || resource === 'storage') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.realtimeService.emitMutation(resource, method);
      }),
    );
  }
}
