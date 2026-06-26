import { Controller, Post, Get, Put, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser, Roles, RequestUser } from '@cannaroute/shared';
import { ISendNotificationPayload } from '@cannaroute/shared';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /notifications/send
   * Internal only — called by other services (order, delivery).
   * Not exposed to end users. Platform admin only for manual sends.
   */
  @Roles('platform_admin')
  @Post('send')
  @HttpCode(HttpStatus.OK)
  send(@Body() payload: ISendNotificationPayload) {
    return this.notificationService.send(payload);
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
   * Update which notification types the user wants to receive.
   */
  @Put('preferences')
  updatePreferences(
    @CurrentUser() user: RequestUser,
    @Body() prefs: Record<string, boolean>,
  ) {
    return this.notificationService.updatePreferences(user.id, prefs);
  }
}
