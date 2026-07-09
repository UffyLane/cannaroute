import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/services/api';

// Show alert + sound even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

/**
 * useNotifications — driver app
 *
 * Same pattern as customer app:
 *   1. Requests permissions
 *   2. Registers Expo push token with backend
 *   3. Taps → navigate to jobs queue or active delivery screen
 */
export function useNotifications() {
  const token       = useAuthStore((s) => s.token);
  const tapListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!token) return;

    let mounted = true;

    (async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken && mounted) {
        await savePushToken(pushToken);
      }
    })();

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

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Push] Skipping — not a physical device');
    return null;
  }

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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CannaRoute Driver',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0f4c35',
      sound: 'default',
    });
  }

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

function handleNotificationTap(data?: Record<string, string>) {
  if (!data) return;

  const screen  = data.screen;
  const orderId = data.order_id;

  switch (screen) {
    case 'active':
      // Navigate to the active delivery detail screen
      if (orderId) router.push(`/delivery/${orderId}`);
      else router.push('/(tabs)');
      break;
    case 'jobs':
      // Navigate to the job queue tab
      router.push('/(tabs)');
      break;
    default:
      router.push('/(tabs)');
  }
}
