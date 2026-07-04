import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/Button';
import { Config } from '@/constants/config';

export default function WelcomeScreen() {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!confirmed) {
      Alert.alert('Age Confirmation Required', 'Please confirm you are 21 or older to continue.');
      return;
    }
    router.push('/(auth)/login');
  };

  const handleUnderAge = () => {
    Alert.alert(
      'Access Denied',
      `You must be ${Config.minimumAge} or older to use CannaRoute.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-900">
      <StatusBar style="light" />

      <View className="flex-1 px-8 justify-between py-12">
        {/* Logo + headline */}
        <View className="items-center mt-8">
          <Text className="text-6xl mb-4">🌿</Text>
          <Text className="text-4xl font-bold text-white tracking-tight">CannaRoute</Text>
          <Text className="text-brand-300 text-base mt-2 text-center">
            Farm-to-door cannabis delivery
          </Text>
        </View>

        {/* Age gate */}
        <View className="bg-white/10 rounded-3xl p-6">
          <Text className="text-white text-xl font-semibold text-center mb-2">
            Are you {Config.minimumAge} or older?
          </Text>
          <Text className="text-brand-300 text-sm text-center mb-6">
            You must be {Config.minimumAge}+ to purchase cannabis products in your state.
          </Text>

          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => setConfirmed((v) => !v)}
            className="flex-row items-center mb-6"
            activeOpacity={0.7}
          >
            <View
              className={[
                'w-6 h-6 rounded border-2 mr-3 items-center justify-center',
                confirmed ? 'bg-accent-500 border-accent-500' : 'border-white/50',
              ].join(' ')}
            >
              {confirmed && <Text className="text-white text-xs font-bold">✓</Text>}
            </View>
            <Text className="text-white text-sm flex-1">
              I confirm I am {Config.minimumAge} years of age or older
            </Text>
          </TouchableOpacity>

          <Button
            label={`Yes, I'm ${Config.minimumAge}+`}
            onPress={handleConfirm}
            variant="primary"
            size="lg"
            fullWidth
            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
          />

          <TouchableOpacity onPress={handleUnderAge} className="mt-4 items-center">
            <Text className="text-brand-300 text-sm">No, I am under {Config.minimumAge}</Text>
          </TouchableOpacity>
        </View>

        {/* Legal footer */}
        <Text className="text-brand-400 text-xs text-center leading-5">
          By continuing you agree to our Terms of Service and Privacy Policy.{'\n'}
          Cannabis products are for adult use only. Not for sale to minors.
        </Text>
      </View>
    </SafeAreaView>
  );
}
