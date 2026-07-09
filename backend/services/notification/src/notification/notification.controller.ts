import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { NotificationService, OrderEvent } from './notification.service';
import { CurrentUser, Public, Roles, RequestUser } from '@cannaroute/shared';
import { ISendNotificationPayload } from '@cannaroute/shared';
import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';

class OrderUpdateDto {
  @IsEnum([
    'order_placed', 'order_confirmed', 'order_preparing',
    'order_picked_up', 'order_in_transit', 'order_delivered',
    'order_cancelled', 'new_job', 'job_assigned',
    'payment_captured', 'payment_failed',
  ])
  event: OrderEvent;

  @IsUUID()
  user_id: string;

  @IsUUID()
  order_id: string;

  @IsOptional()
  @IsString()
  dispensary_name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimated_minutes?: number;

  @IsOptional()
  @IsString()
  total_formatted?: string;
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /notifications/send
   * Manual send — platform admin only. For one-off or test notifications.
   */
  @Roles('platform_admin')
  @Post('send')
  @HttpCode(HttpStatus.OK)
  send(@Body() payload: ISendNotificationPayload) {
    return this.notificationService.send(payload);
  }

  /**
   * POST /notifications/order-update
   * Internal service-to-service endpoint — called by order/payment/delivery services
   * whenever an order lifecycle event occurs.
   * Secured by X-Internal-Service header.
   */
  @Public()
  @Post('order-update')
  @HttpCode(HttpStatus.OK)
  async orderUpdate(
    @Body() dto: OrderUpdateDto,
    @Headers('x-internal-service') internalService: string,
  ) {
    if (!internalService) return { sent: false, reason: 'missing internal header' };

    await this.notificationService.sendOrderNotification({
      event:             dto.event,
      user_id:           dto.user_id,
      order_id:          dto.order_id,
      dispensary_name:   dto.dispensary_name,
      estimated_minutes: dto.estimated_minutes,
      total_formatted:   dto.total_formatted,
    });

    return { sent: true };
  }

  /**
   * GET /notifications/history
   * Returns the authenticated user's notification history.
   */
  @Get('history')
  getHistory(@CurrentUser() user: RequestUser) {
    return this.notificationService.getHistory(user.id);
  }

  /**
   * PUT /notifications/preferences
   * Update notification preferences for the current user.
   */
  @Put('preferences')
  updatePreferences(
    @CurrentUser() user: RequestUser,
    @Body() prefs: Record<string, boolean>,
  ) {
    return this.notificationService.updatePreferences(user.id, prefs);
  }
}
