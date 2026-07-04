import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, padded = true, elevated = true, style, ...rest }: CardProps) {
  return (
    <View
      className={[
        'bg-white rounded-2xl overflow-hidden',
        padded ? 'p-4' : '',
        elevated ? 'shadow-sm' : '',
      ].join(' ')}
      style={[{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, style as object]}
      {...rest}
    >
      {children}
    </View>
  );
}
