import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  ...rest
}: InputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-1.5">{label}</Text>
      )}

      <View
        className={[
          'flex-row items-center border rounded-xl bg-white px-3',
          error ? 'border-red-400' : 'border-neutral-300',
        ].join(' ')}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className="flex-1 py-3 text-base text-neutral-900"
          placeholderTextColor="#a3a3a3"
          secureTextEntry={isPassword && !isVisible}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setIsVisible((v) => !v)} className="ml-2 p-1">
            <Text className="text-sm text-brand-700">{isVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && <View className="ml-2">{rightIcon}</View>}
      </View>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
      {hint && !error && <Text className="mt-1 text-xs text-neutral-500">{hint}</Text>}
    </View>
  );
}
