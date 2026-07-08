import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#060f08' }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }
  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#060f08' } }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
