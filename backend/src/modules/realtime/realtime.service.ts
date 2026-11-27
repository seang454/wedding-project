import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RealtimeMutationEvent {
  resource: string;
  method: string;
  timestamp: number;
}

@Injectable()
export class RealtimeService {
  private readonly events$ = new Subject<RealtimeMutationEvent>();

  emitMutation(resource: string, method: string) {
    this.events$.next({
      resource,
      method,
      timestamp: Date.now(),
    });
  }

  getStream(): Observable<MessageEvent> {
    const mutationStream$ = this.events$
      .asObservable()
      .pipe(map((event) => ({ data: event }) as MessageEvent));

    const heartbeat$ = interval(25000).pipe(
      map(() => ({ type: 'ping', data: 'ping' }) as MessageEvent),
    );

    return merge(mutationStream$, heartbeat$);
  }
}
