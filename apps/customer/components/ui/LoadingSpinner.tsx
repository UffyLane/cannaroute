import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color="#f59e0b" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#060f08',
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },
});
