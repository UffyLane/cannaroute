import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { App, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { Twilio } from 'twilio';
import { Notification } from './notification.entity';
import { NotificationType, NotificationChannel, ISendNotificationPayload } from '@cannaroute/shared';

/**
 * NotificationService — single entry point for all outbound communications.
 *
 * Channel routing:
 *   FCM push  → customer/driver mobile apps
 *   Twilio SMS → delivery alerts, OTP (no app required)
 *   SendGrid  → receipts, verification emails (not yet wired — Phase 2)
 *
 * Every notification is logged to the notifications table regardless of channel.
 * This gives us a full audit trail + the basis for a "notification history" screen.
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

  // ─── Send notification (internal endpoint) ────────────────────────────────

  async send(payload: ISendNotificationPayload): Promise<Notification> {
    const log = this.notificationsRepo.create({
      user_id: payload.user_id,
      type: payload.type,
      channel: payload.channel,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? null,
      status: 'pending',
    });

    const saved = await this.notificationsRepo.save(log);

    // Fire and handle result
    try {
      if (payload.channel === 'push' && payload.fcm_token) {
        await this.sendPush(payload.fcm_token, payload.title ?? '', payload.body, payload.data);
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

  // ─── Get notification history ─────────────────────────────────────────────

  async getHistory(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationsRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // ─── Preferences ─────────────────────────────────────────────────────────
  // TODO: add a notification_preferences table in Phase 2
  // For now: stub that acknowledges the update
  async updatePreferences(userId: string, prefs: Record<string, boolean>) {
    this.logger.log(`Preferences update for user ${userId}: ${JSON.stringify(prefs)}`);
    return { user_id: userId, preferences: prefs, updated: true };
  }

  // ─── FCM push ─────────────────────────────────────────────────────────────

  private async sendPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized — skipping push notification');
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

  // ─── Twilio SMS ───────────────────────────────────────────────────────────

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

  // ─── Init ─────────────────────────────────────────────────────────────────

  private initFirebase(): void {
    const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled');
      return;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (err) {
      this.logger.error('Firebase init failed', err);
    }
  }

  private initTwilio(): void {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    if (!sid || !token) {
      this.logger.warn('Twilio credentials not set — SMS disabled');
      return;
    }
    this.twilioClient = new Twilio(sid, token);
    this.logger.log('Twilio client initialized');
  }
}
