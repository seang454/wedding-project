import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Check if the backend and PostgreSQL database are healthy',
  })
  check() {
    return this.health.check([
      // Pings the PostgreSQL database connection
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }
}
