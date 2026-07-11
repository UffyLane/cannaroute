import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '@cannaroute/shared';
import { User } from '../users/user.entity';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * GET /admin/stats
   * Platform-wide aggregate stats for the admin dashboard.
   * Counts come from the users table; orders/revenue are stubs (no cross-service call).
   */
  @Roles('platform_admin')
  @Get('stats')
  async getStats() {
    const [totalUsers, activeDispensaries, activeDrivers, activeGrowers] =
      await Promise.all([
        this.userRepo.count(),
        this.userRepo.count({ where: { role: 'dispensary_admin' as any } }),
        this.userRepo.count({ where: { role: 'driver' as any } }),
        this.userRepo.count({ where: { role: 'grower' as any } }),
      ]);

    return {
      totalUsers,
      totalOrders: 0,       // cross-service; stubbed for now
      totalRevenue: 0,      // cross-service; stubbed for now
      activeDispensaries,
      activeDrivers,
      activeGrowers,
    };
  }

  /**
   * GET /admin/health
   * Pings every Render microservice and returns latency + status.
   */
  @Roles('platform_admin')
  @Get('health')
  async getHealth() {
    const services = [
      { name: 'auth-service',        url: 'https://cannaroute-auth.onrender.com/health' },
      { name: 'order-service',       url: 'https://cannaroute-order.onrender.com/health' },
      { name: 'inventory-service',   url: 'https://cannaroute-inventory.onrender.com/health' },
      { name: 'delivery-service',    url: 'https://cannaroute-delivery.onrender.com/health' },
      { name: 'compliance-service',  url: 'https://cannaroute-compliance.onrender.com/health' },
      { name: 'grower-service',      url: 'https://cannaroute-grower.onrender.com/health' },
    ];

    const results = await Promise.all(
      services.map(async (s) => {
        const start = Date.now();
        try {
          const res = await fetch(s.url, {
            signal: AbortSignal.timeout(6000),
          });
          const latencyMs = Date.now() - start;
          return {
            name: s.name,
            status: res.ok ? 'ok' : ('degraded' as const),
            latencyMs,
            lastChecked: new Date().toISOString(),
          };
        } catch {
          return {
            name: s.name,
            status: 'down' as const,
            latencyMs: 0,
            lastChecked: new Date().toISOString(),
          };
        }
      }),
    );

    return { services: results };
  }

  /**
   * GET /admin/users?role=driver
   * List all users, optionally filtered by role.
   */
  @Roles('platform_admin')
  @Get('users')
  async getUsers(@Query('role') role?: string) {
    const where = role && role !== 'all' ? { role: role as any } : {};
    const users = await this.userRepo.find({
      where,
      order: { created_at: 'DESC' },
      take: 500,
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      isVerified: u.age_verified,
      createdAt: u.created_at,
    }));
  }

  /**
   * PATCH /admin/users/:id
   * Toggle isVerified (age_verified) for a user.
   */
  @Roles('platform_admin')
  @Patch('users/:id')
  async patchUser(
    @Param('id') id: string,
    @Body() body: { isVerified?: boolean },
  ) {
    if (body.isVerified !== undefined) {
      await this.userRepo.update(id, { age_verified: body.isVerified });
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return {};
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.age_verified,
      createdAt: user.created_at,
    };
  }
}
