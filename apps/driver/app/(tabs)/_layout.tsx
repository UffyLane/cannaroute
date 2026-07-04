import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '@/store/auth.store';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 24 : 21, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function DriverTabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f4c35',
        tabBarInactiveTintColor: '#a3a3a3',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e5e5e5', height: 72, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Queue', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Account', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
      />
    </Tabs>
  );
}
