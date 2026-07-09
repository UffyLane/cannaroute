import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CurrentUser, Roles, Public, RequestUser } from '@cannaroute/shared';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('customer')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Roles('dispensary_admin', 'platform_admin')
  @Patch(':id/confirm')
  confirm(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignDriverDto) {
    return this.ordersService.confirm(id, dto);
  }

  @Roles('driver', 'platform_admin')
  @Patch(':id/pickup')
  markPickedUp(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.markPickedUp(id);
  }

  @Roles('driver', 'platform_admin')
  @Patch(':id/deliver')
  markDelivered(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.markDelivered(id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ordersService.cancel(id, dto, user);
  }

  @Roles('driver', 'dispensary_admin', 'platform_admin')
  @Get(':id/manifest')
  getManifest(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getManifest(id);
  }

  /**
   * PATCH /api/v1/orders/:id/payment-status
   * Called by the payment service (service-to-service) to update payment status.
   * Validated via X-Internal-Service header — not a JWT-protected route.
   */
  @Public()
  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { payment_status: string },
    @Headers('x-internal-service') internalService: string,
  ) {
    if (internalService !== 'payment-service') {
      return { error: 'Forbidden' };
    }
    return this.ordersService.updatePaymentStatus(id, body.payment_status);
  }
}
