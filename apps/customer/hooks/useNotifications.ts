import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/services/api';

// ── Notification handler (foreground) ────────────────────────────────────────
// Show the alert + play sound even while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useNotifications — customer app
 *
 * On mount (after user is authenticated):
 *   1. Requests push notification permissions
 *   2. Gets the Expo push token
 *   3. Registers the token with the backend (POST /auth/push-token)
 *   4. Sets up a notification tap listener → deep-links to the right screen
 *
 * Call this once from the root _layout.tsx after the auth state is ready.
 */
export function useNotifications() {
  const token     = useAuthStore((s) => s.token);
  const tapListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!token) return; // Not logged in — skip

    let mounted = true;

    (async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken && mounted) {
        await savePushToken(pushToken);
      }
    })();

    // Listen for notification taps (background / killed → app opened)
    tapListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      handleNotificationTap(data);
    });

    return () => {
      mounted = false;
      tapListener.current?.remove();
    };
  }, [token]);
}

// ── Permission + token registration ──────────────────────────────────────────

async function registerForPushNotifications(): Promise<string | null> {
  // Expo push only works on a real device
  if (!Device.isDevice) {
    console.log('[Push] Skipping — not a physical device');
    return null;
  }

  // Check / request permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission denied');
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CannaRoute',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
      sound: 'default',
    });
  }

  // Get Expo push token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('[Push] No projectId found — set expo.extra.eas.projectId in app.json');
    return null;
  }

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Push] Token registered:', expoPushToken.slice(0, 40) + '…');
    return expoPushToken;
  } catch (err) {
    console.error('[Push] Failed to get push token', err);
    return null;
  }
}

async function savePushToken(token: string): Promise<void> {
  try {
    await api.post('/auth/push-token', { token });
  } catch (err) {
    console.warn('[Push] Failed to save token to backend', err);
  }
}

// ── Deep-link routing on notification tap ────────────────────────────────────

function handleNotificationTap(data?: Record<string, string>) {
  if (!data) return;

  const screen  = data.screen;
  const orderId = data.order_id;

  switch (screen) {
    case 'track':
      if (orderId) router.push(`/track/${orderId}`);
      break;
    case 'orders':
      router.push('/(tabs)/orders');
      break;
    case 'checkout':
      router.push('/checkout');
      break;
    default:
      router.push('/(tabs)');
  }
}
