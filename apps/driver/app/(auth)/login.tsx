import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function DriverLoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Login Failed', 'Check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <View className="flex-1 px-8 justify-center">
        <View className="items-center mb-12">
          <Text className="text-5xl mb-3">🚗</Text>
          <Text className="text-3xl font-bold text-white">Driver Login</Text>
          <Text className="text-brand-300 text-sm mt-1">CannaRoute Delivery App</Text>
        </View>

        <View className="bg-white rounded-2xl p-6">
          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-1.5">Email</Text>
            <TextInput
              className="border border-neutral-200 rounded-xl px-4 py-3 text-base text-neutral-900"
              placeholder="driver@cannaroute.com"
              placeholderTextColor="#a3a3a3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-700 mb-1.5">Password</Text>
            <TextInput
              className="border border-neutral-200 rounded-xl px-4 py-3 text-base text-neutral-900"
              placeholder="Password"
              placeholderTextColor="#a3a3a3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-brand-900 rounded-xl py-4 items-center"
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
