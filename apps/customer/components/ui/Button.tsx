import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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

const containerStyles: Record<Variant, string> = {
  primary: 'bg-brand-900 border border-brand-900',
  secondary: 'bg-brand-100 border border-brand-100',
  outline: 'bg-transparent border border-brand-900',
  ghost: 'bg-transparent border border-transparent',
  danger: 'bg-red-600 border border-red-600',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-brand-900',
  outline: 'text-brand-900',
  ghost: 'text-brand-900',
  danger: 'text-white',
};

const sizeContainerStyles: Record<Size, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};

const sizeTextStyles: Record<Size, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
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
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        containerStyles[variant],
        sizeContainerStyles[size],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : '#0f4c35'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text className={[textStyles[variant], sizeTextStyles[size], leftIcon ? 'ml-2' : '', rightIcon ? 'mr-2' : ''].join(' ')}>
            {label}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
