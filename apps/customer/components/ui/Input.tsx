import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  /** 'light' = white bg (default market screens), 'dark' = auth dark theme */
  theme?: 'light' | 'dark';
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  theme = 'light',
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setFocused(true);
    Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const isDark = theme === 'dark';

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: error
      ? ['#ef4444', '#ef4444']
      : isDark
      ? ['rgba(255,255,255,0.15)', '#f59e0b']
      : ['#d4d4d4', '#0f4c35'],
  });

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          isDark ? styles.containerDark : styles.containerLight,
          { borderColor },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            leftIcon ? styles.inputWithLeft : null,
          ]}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.30)' : '#a3a3a3'}
          secureTextEntry={isPassword && !isVisible}
          autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.eyeText, isDark ? styles.eyeTextDark : styles.eyeTextLight]}>
              {isVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && (
        <Text style={[styles.hintText, isDark ? styles.hintDark : styles.hintLight]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  labelLight: { color: '#404040' },
  labelDark: { color: 'rgba(255,255,255,0.75)' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  containerLight: { backgroundColor: '#ffffff' },
  containerDark: { backgroundColor: 'rgba(255,255,255,0.07)' },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  inputLight: { color: '#171717' },
  inputDark: { color: '#ffffff' },
  inputWithLeft: { marginLeft: 10 },
  leftIcon: { marginRight: 2 },
  rightIcon: { marginLeft: 8 },
  eyeBtn: { paddingLeft: 10 },
  eyeText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  eyeTextLight: { color: '#0f4c35' },
  eyeTextDark: { color: '#f59e0b' },
  errorText: { marginTop: 6, fontSize: 12, color: '#ef4444' },
  hintText: { marginTop: 6, fontSize: 12 },
  hintLight: { color: '#737373' },
  hintDark: { color: 'rgba(255,255,255,0.40)' },
});
