import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';
import { MutationEventsInterceptor } from './mutation-events.interceptor';
import { WeddingAccessService } from '../../common/services/wedding-access.service';

@Global()
@Module({
  controllers: [RealtimeController],
  providers: [
    RealtimeService,
    WeddingAccessService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MutationEventsInterceptor,
    },
  ],
  exports: [RealtimeService, WeddingAccessService],
})
export class RealtimeModule {}
