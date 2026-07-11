import { Controller, Get } from '@nestjs/common';
import { Roles } from '@cannaroute/shared';

/**
 * GET /drivers
 * Returns driver roster for the dispensary dashboard.
 * Real implementation would join users + driver_profiles tables.
 * Demo returns seeded demo data.
 */
@Controller('drivers')
export class DriversController {
  @Roles('dispensary_admin', 'platform_admin')
  @Get()
  findAll() {
    return [
      {
        id: '11111111-aaaa-4aaa-8aaa-111111111111',
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: 'driver@demo.cannaroute.com',
        phone: '(313) 555-0201',
        vehicleYear: 2021,
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        licenseNumber: 'D123-456-789-01',
        totalDeliveries: 47,
        status: 'available',
      },
      {
        id: '22222222-bbbb-4bbb-8bbb-222222222222',
        firstName: 'Aisha',
        lastName: 'Williams',
        email: 'driver2@demo.cannaroute.com',
        phone: '(313) 555-0202',
        vehicleYear: 2020,
        vehicleMake: 'Honda',
        vehicleModel: 'Accord',
        licenseNumber: 'D987-654-321-02',
        totalDeliveries: 89,
        status: 'on_delivery',
      },
      {
        id: '33333333-cccc-4ccc-8ccc-333333333333',
        firstName: 'Devon',
        lastName: 'Taylor',
        email: 'driver3@demo.cannaroute.com',
        phone: '(313) 555-0203',
        vehicleYear: 2022,
        vehicleMake: 'Ford',
        vehicleModel: 'Fusion',
        licenseNumber: 'D456-789-123-03',
        totalDeliveries: 12,
        status: 'offline',
      },
    ];
  }
}
