import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    const { firstName, lastName, email, password, dateOfBirth } = form;
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dateOfBirth)) {
      Alert.alert('Invalid Date', 'Date of birth must be in YYYY-MM-DD format.');
      return;
    }
    try {
      clearError();
      await register({ firstName, lastName, email: email.trim().toLowerCase(), password, dateOfBirth });
      router.replace('/(tabs)');
    } catch {
      // Error displayed via store
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-10">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-neutral-900">Create account</Text>
            <Text className="text-neutral-500 mt-2">Get cannabis delivered to your door</Text>
          </View>

          {/* Name row */}
          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <Input
                label="First name"
                placeholder="Jane"
                value={form.firstName}
                onChangeText={set('firstName')}
                autoComplete="given-name"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Last name"
                placeholder="Doe"
                value={form.lastName}
                onChangeText={set('lastName')}
                autoComplete="family-name"
              />
            </View>
          </View>

          <Input
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChangeText={set('password')}
            isPassword
            hint="At least 8 characters with a number and special character"
          />

          <Input
            label="Date of birth"
            placeholder="YYYY-MM-DD"
            value={form.dateOfBirth}
            onChangeText={set('dateOfBirth')}
            keyboardType="numeric"
            hint="You must be 21+ to use CannaRoute"
          />

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          )}

          <Button
            label="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            size="lg"
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-neutral-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-brand-700 text-sm font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
