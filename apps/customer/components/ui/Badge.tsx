import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const containerStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
  neutral: 'bg-neutral-100',
  brand: 'bg-brand-100',
};

const textStyles: Record<BadgeVariant, string> = {
  success: 'text-green-700',
  warning: 'text-amber-700',
  error: 'text-red-700',
  info: 'text-blue-700',
  neutral: 'text-neutral-700',
  brand: 'text-brand-800',
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  return (
    <View className={['rounded-full px-2.5 py-0.5 self-start', containerStyles[variant]].join(' ')}>
      <Text
        className={[
          'font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm',
          textStyles[variant],
        ].join(' ')}
      >
        {label}
      </Text>
    </View>
  );
}
