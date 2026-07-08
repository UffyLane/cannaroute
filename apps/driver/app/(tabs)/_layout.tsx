import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth.store';

const TAB_BG = '#080f0a';
const GOLD   = '#f59e0b';
const MUTED  = 'rgba(255,255,255,0.38)';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ focused, name }: { focused: boolean; name: IoniconName }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={23}
      color={focused ? GOLD : MUTED}
    />
  );
}

export default function DriverTabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isLoading && !isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Queue',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="list" />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="time" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person" />,
        }}
      />
    </Tabs>
  );
}
