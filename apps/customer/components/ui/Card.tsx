import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, padded = true, elevated = true, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  padded: { padding: 16 },
});
