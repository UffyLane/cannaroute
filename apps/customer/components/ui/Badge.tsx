import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  warning: { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
  error:   { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
  info:    { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd' },
  neutral: { bg: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.65)' },
  brand:   { bg: 'rgba(15,76,53,0.45)',    text: '#6ee7b7' },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text, fontSize: size === 'sm' ? 11 : 13 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: { fontWeight: '600' },
});
