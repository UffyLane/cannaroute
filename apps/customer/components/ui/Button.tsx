import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
  View,
} from 'react-native';

type Variant = 'primary' | 'gold' | 'secondary' | 'outline' | 'outline-gold' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyle: Record<Variant, { bg: string; border: string; text: string }> = {
  primary:      { bg: '#0f4c35', border: '#0f4c35',           text: '#ffffff' },
  gold:         { bg: '#f59e0b', border: '#f59e0b',           text: '#0a1a0f' },
  secondary:    { bg: '#dcf4e6', border: '#dcf4e6',           text: '#0f4c35' },
  outline:      { bg: 'transparent', border: '#0f4c35',       text: '#0f4c35' },
  'outline-gold':{ bg: 'transparent', border: '#f59e0b',      text: '#f59e0b' },
  ghost:        { bg: 'transparent', border: 'transparent',   text: '#0f4c35' },
  danger:       { bg: '#dc2626', border: '#dc2626',           text: '#ffffff' },
};

const sizeStyle: Record<Size, { paddingH: number; paddingV: number; radius: number; fontSize: number }> = {
  sm: { paddingH: 14, paddingV: 9,  radius: 10, fontSize: 14 },
  md: { paddingH: 20, paddingV: 13, radius: 13, fontSize: 16 },
  lg: { paddingH: 24, paddingV: 17, radius: 16, fontSize: 17 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const vs = variantStyle[variant];
  const ss = sizeStyle[size];

  return (
    <TouchableOpacity
      activeOpacity={0.80}
      disabled={isDisabled}
      style={[
        {
          backgroundColor: vs.bg,
          borderColor: vs.border,
          borderWidth: 1.5,
          borderRadius: ss.radius,
          paddingHorizontal: ss.paddingH,
          paddingVertical: ss.paddingV,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'auto' : 'flex-start',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'gold' ? '#0a1a0f' : variant === 'primary' || variant === 'danger' ? '#ffffff' : '#0f4c35'}
        />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fontSize,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
