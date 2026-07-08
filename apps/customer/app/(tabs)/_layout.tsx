import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

function CartTabIcon({ focused }: { focused: boolean }) {
  const itemCount = useCartStore((s) => s.itemCount);
  return (
    <View>
      <TabIcon focused={focused} name="bag" />
      {itemCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            backgroundColor: GOLD,
            borderRadius: 9,
            minWidth: 17,
            height: 17,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: '#0a1a0f', fontSize: 10, fontWeight: '700' }}>{itemCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

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
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="compass" />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="receipt" />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
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
