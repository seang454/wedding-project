import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { MutationEventsInterceptor } from './mutation-events.interceptor';
import { RealtimeService } from './realtime.service';

describe('MutationEventsInterceptor', () => {
  const createContext = (method: string, url: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, url }),
      }),
    }) as unknown as ExecutionContext;

  const nextHandler: CallHandler = {
    handle: () => of({ ok: true }),
  };

  it('does not emit for GET requests', async () => {
    const realtime = { emitMutation: jest.fn() } as unknown as RealtimeService;
    const interceptor = new MutationEventsInterceptor(realtime);

    await lastValueFrom(
      interceptor.intercept(createContext('GET', '/api/gifts'), nextHandler),
    );
    expect(realtime.emitMutation).not.toHaveBeenCalled();
  });

  it('does not emit for /api/auth or /api/storage mutations', async () => {
    const realtime = { emitMutation: jest.fn() } as unknown as RealtimeService;
    const interceptor = new MutationEventsInterceptor(realtime);

    await lastValueFrom(
      interceptor.intercept(createContext('POST', '/api/auth/login'), nextHandler),
    );
    await lastValueFrom(
      interceptor.intercept(createContext('POST', '/api/storage/presigned-url'), nextHandler),
    );
    expect(realtime.emitMutation).not.toHaveBeenCalled();
  });

  it('emits resource and method for domain mutations', async () => {
    const realtime = { emitMutation: jest.fn() } as unknown as RealtimeService;
    const interceptor = new MutationEventsInterceptor(realtime);

    await lastValueFrom(
      interceptor.intercept(createContext('POST', '/api/gifts'), nextHandler),
    );
    await lastValueFrom(
      interceptor.intercept(createContext('PATCH', '/api/guests/123'), nextHandler),
    );
    await lastValueFrom(
      interceptor.intercept(createContext('DELETE', '/api/weddings/456'), nextHandler),
    );

    expect(realtime.emitMutation).toHaveBeenCalledTimes(3);
    expect(realtime.emitMutation).toHaveBeenNthCalledWith(1, 'gifts', 'POST');
    expect(realtime.emitMutation).toHaveBeenNthCalledWith(2, 'guests', 'PATCH');
    expect(realtime.emitMutation).toHaveBeenNthCalledWith(3, 'weddings', 'DELETE');
  });
});
