import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { App, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Twilio } from 'twilio';
import { Notification } from './notification.entity';
import { ISendNotificationPayload } from '@cannaroute/shared';

// ── Order notification event types ────────────────────────────────────────────

export type OrderEvent =
  | 'order_placed'       // → dispensary
  | 'order_confirmed'    // → customer
  | 'order_preparing'    // → customer
  | 'order_picked_up'    // → customer
  | 'order_in_transit'   // → customer
  | 'order_delivered'    // → customer
  | 'order_cancelled'    // → customer
  | 'new_job'            // → driver (new delivery available)
  | 'job_assigned'       // → driver (confirmed assignment)
  | 'payment_captured'   // → customer (CanPay confirmed)
  | 'payment_failed';    // → customer

interface OrderNotificationParams {
  event: OrderEvent;
  user_id: string;
  order_id: string;
  dispensary_name?: string;
  estimated_minutes?: number;
  total_formatted?: string; // e.g. "$42.00"
}

// Pre-built message templates for every order lifecycle event
const ORDER_TEMPLATES: Record<OrderEvent, (p: OrderNotificationParams) => { title: string; body: string }> = {
  order_placed:     (p) => ({
    title: '🛍️ New Order Received',
    body:  `Order #${p.order_id.slice(0, 8).toUpperCase()} is waiting for confirmation.`,
  }),
  order_confirmed:  (p) => ({
    title: '✅ Order Confirmed',
    body:  p.estimated_minutes
      ? `Your order is confirmed! Estimated delivery in ~${p.estimated_minutes} minutes.`
      : `Your order has been confirmed and is being prepared.`,
  }),
  order_preparing:  (p) => ({
    title: '🌿 Order Being Prepared',
    body:  `${p.dispensary_name ?? 'Your dispensary'} is packing your order now.`,
  }),
  order_picked_up:  (p) => ({
    title: '🚗 Driver Picked Up Your Order',
    body:  'Your driver has the package and is heading your way!',
  }),
  order_in_transit: (p) => ({
    title: '📍 On the Way',
    body:  'Your driver is en route. Track live in the app.',
  }),
  order_delivered:  (p) => ({
    title: '🎉 Delivered!',
    body:  'Your order has been delivered. Enjoy!',
  }),
  order_cancelled:  (p) => ({
    title: '❌ Order Cancelled',
    body:  `Order #${p.order_id.slice(0, 8).toUpperCase()} was cancelled.`,
  }),
  new_job:          (p) => ({
    title: '📦 New Delivery Available',
    body:  `A new delivery job is ready for pickup${p.total_formatted ? ` — ${p.total_formatted}` : ''}.`,
  }),
  job_assigned:     (p) => ({
    title: '✅ Job Confirmed',
    body:  `You've been assigned order #${p.order_id.slice(0, 8).toUpperCase()}. Head to the dispensary for pickup.`,
  }),
  payment_captured: (p) => ({
    title: '💳 Payment Confirmed',
    body:  `CanPay payment of ${p.total_formatted ?? ''} received for order #${p.order_id.slice(0, 8).toUpperCase()}.`,
  }),
  payment_failed:   (p) => ({
    title: '⚠️ Payment Failed',
    body:  'Your payment could not be processed. Please try again or choose a different payment method.',
  }),
};

/**
 * NotificationService — single entry point for all outbound communications.
 *
 * Channels:
 *   Expo Push API → customer/driver mobile apps (primary)
 *   FCM           → fallback / direct Firebase (if Expo token unavailable)
 *   Twilio SMS    → delivery alerts, no-app fallback
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: App | null = null;
  private twilioClient: Twilio | null = null;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    private readonly config: ConfigService,
  ) {
    this.initFirebase();
    this.initTwilio();
  }

  // ─── Send (generic) ───────────────────────────────────────────────────────

  async send(payload: ISendNotificationPayload): Promise<Notification> {
    const log = this.notificationsRepo.create({
      user_id: payload.user_id,
      type: payload.type,
      channel: payload.channel,
      title: payload.title ?? '',
      body: payload.body,
      data: payload.data ?? null,
      status: 'pending',
    });

    const saved = await this.notificationsRepo.save(log);

    try {
      if (payload.channel === 'push') {
        // Try Expo push first, fall back to FCM
        if (payload.expo_push_token) {
          await this.sendExpoPush(payload.expo_push_token, payload.title ?? '', payload.body, payload.data);
        } else if (payload.fcm_token) {
          await this.sendFcmPush(payload.fcm_token, payload.title ?? '', payload.body, payload.data);
        } else {
          this.logger.warn(`No push token for user ${payload.user_id} — skipping push`);
        }
      } else if (payload.channel === 'sms' && payload.phone_number) {
        await this.sendSms(payload.phone_number, payload.body);
      }

      await this.notificationsRepo.update(saved.id, { status: 'sent', sent_at: new Date() });
      saved.status = 'sent';
    } catch (err) {
      this.logger.error(`Notification send failed: ${payload.type} to user ${payload.user_id}`, err);
      await this.notificationsRepo.update(saved.id, {
        status: 'failed',
        error_message: (err as Error).message,
      });
      saved.status = 'failed';
    }

    return saved;
  }

  // ─── Order lifecycle notification ─────────────────────────────────────────

  /**
   * Send a pre-templated notification for an order lifecycle event.
   * Resolves the user's push token from the auth service automatically.
   */
  async sendOrderNotification(params: OrderNotificationParams): Promise<void> {
    const template = ORDER_TEMPLATES[params.event];
    if (!template) {
      this.logger.warn(`No template for event: ${params.event}`);
      return;
    }

    const { title, body } = template(params);

    // Resolve push token from auth service
    const pushToken = await this.resolvePushToken(params.user_id);

    const data: Record<string, string> = {
      event: params.event,
      order_id: params.order_id,
      screen: this.resolveDeepLinkScreen(params.event),
    };

    await this.send({
      user_id:         params.user_id,
      type:            params.event,
      channel:         'push',
      title,
      body,
      data,
      expo_push_token: pushToken ?? undefined,
    });
  }

  // ─── History + Preferences ────────────────────────────────────────────────

  async getHistory(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationsRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async updatePreferences(userId: string, prefs: Record<string, boolean>) {
    this.logger.log(`Preferences update for user ${userId}: ${JSON.stringify(prefs)}`);
    return { user_id: userId, preferences: prefs, updated: true };
  }

  // ─── Expo Push API ────────────────────────────────────────────────────────

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    // Expo Push Notification format
    const message = {
      to:    token,
      sound: 'default',
      title,
      body,
      data:  data ?? {},
      priority: 'high',
      channelId: 'default', // Android notification channel
    };

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Expo Push API error ${res.status}: ${text}`);
    }

    const json = await res.json();
    if (json.data?.status === 'error') {
      throw new Error(`Expo Push error: ${json.data.message}`);
    }

    this.logger.log(`Expo push sent to ${token.slice(0, 30)}…`);
  }

  // ─── FCM (Firebase) ───────────────────────────────────────────────────────

  private async sendFcmPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized — skipping FCM push');
      return;
    }

    await getMessaging(this.firebaseApp).send({
      token,
      notification: { title, body },
      data: data ?? {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  }

  // ─── SMS ──────────────────────────────────────────────────────────────────

  private async sendSms(to: string, body: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio not initialized — skipping SMS');
      return;
    }

    await this.twilioClient.messages.create({
      to,
      from: this.config.get<string>('TWILIO_PHONE_NUMBER'),
      body,
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Resolve a user's Expo push token from the auth service.
   */
  private async resolvePushToken(userId: string): Promise<string | null> {
    const authUrl = this.config.get<string>('AUTH_SERVICE_URL', 'http://localhost:3001');
    try {
      const res = await fetch(`${authUrl}/api/v1/auth/users/${userId}/push-token`, {
        headers: { 'X-Internal-Service': 'notification-service' },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.token ?? null;
    } catch (err) {
      this.logger.warn(`Could not resolve push token for user ${userId}`);
      return null;
    }
  }

  /**
   * Map order event to the deep-link screen name.
   * The mobile app reads `data.screen` from the notification payload
   * and navigates accordingly.
   */
  private resolveDeepLinkScreen(event: OrderEvent): string {
    const map: Record<OrderEvent, string> = {
      order_placed:     'orders',
      order_confirmed:  'track',
      order_preparing:  'track',
      order_picked_up:  'track',
      order_in_transit: 'track',
      order_delivered:  'orders',
      order_cancelled:  'orders',
      new_job:          'jobs',
      job_assigned:     'active',
      payment_captured: 'orders',
      payment_failed:   'checkout',
    };
    return map[event] ?? 'home';
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  private initFirebase(): void {
    const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — FCM push disabled (Expo Push still active)');
      return;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.firebaseApp = initializeApp({ credential: cert(serviceAccount) });
      this.logger.log('Firebase Admin initialized');
    } catch (err) {
      this.logger.error('Firebase init failed', err);
    }
  }

  private initTwilio(): void {
    const sid   = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    if (!sid || !token) {
      this.logger.warn('Twilio credentials not set — SMS disabled');
      return;
    }
    this.twilioClient = new Twilio(sid, token);
    this.logger.log('Twilio client initialized');
  }
}
