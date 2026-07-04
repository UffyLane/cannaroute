import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View
      className={[
        'items-center justify-center',
        fullScreen ? 'flex-1 bg-neutral-50' : 'py-12',
      ].join(' ')}
    >
      <ActivityIndicator size="large" color={Colors.brand[900]} />
      {message && <Text className="mt-3 text-sm text-neutral-500">{message}</Text>}
    </View>
  );
}
