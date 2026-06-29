import { Controller, Get } from '@nestjs/common';
import { Public } from '@cannaroute/shared';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', service: 'delivery', version: '0.1.0', timestamp: new Date().toISOString() };
  }
}
