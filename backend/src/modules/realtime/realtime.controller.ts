import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';

@ApiTags('Realtime Events')
@Controller('events')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @SkipThrottle()
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.realtimeService.getStream();
  }
}
