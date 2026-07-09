import { Controller, Get } from '@nestjs/common';
import { Public } from '@cannaroute/shared';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check() {
    return {
      status: 'ok',
      service: 'payment-service',
      timestamp: new Date().toISOString(),
    };
  }
}
