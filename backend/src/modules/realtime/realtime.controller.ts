import { Controller, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Realtime Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @SkipThrottle()
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.realtimeService.getStream();
  }
}
