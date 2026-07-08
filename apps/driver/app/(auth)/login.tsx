import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

const { height: SCREEN_H } = Dimensions.get('window');

const BG    = '#060f08';
const GREEN = '#0f4c35';
const GOLD  = '#f59e0b';
const WHITE = '#ffffff';
const MUTED = 'rgba(255,255,255,0.45)';

export default function DriverLoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [emailFocused, setEmailFocused]     = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) { shake(); setError('Enter your email and password.'); return; }
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch {
      shake();
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo / Wordmark */}
            <View style={styles.logoBlock}>
              <View style={styles.logoIconWrap}>
                <View style={styles.logoLeaf} />
                <View style={styles.logoPinCircle} />
              </View>
              <Text style={styles.wordmark}>CannaRoute</Text>
              <View style={styles.goldDivider} />
              <Text style={styles.driverBadge}>Driver Portal</Text>
            </View>

            {/* Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>Sign in to start your shift</Text>
            </View>

            {/* Form */}
            <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
              {/* Email */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  placeholder="you@cannaroute.com"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrap, passwordFocused && styles.inputFocused]}>
                  <TextInput
                    style={[styles.input, styles.inputInner]}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.28)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPwd}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPwd((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{showPwd ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a1a0f" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.legal}>
              CannaRoute Driver Portal · For authorized delivery drivers only.{'\n'}
              Unauthorized access is prohibited.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  circle1: {
    position: 'absolute', top: -120, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(15,76,53,0.32)',
  },
  circle2: {
    position: 'absolute', top: SCREEN_H * 0.40, left: -90,
    width: 230, height: 230, borderRadius: 115,
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  circle3: {
    position: 'absolute', bottom: -60, right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(15,76,53,0.18)',
  },

  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 48 },

  // Logo
  logoBlock: { alignItems: 'center', paddingTop: 52, marginBottom: 40 },
  logoIconWrap: { alignItems: 'center', marginBottom: 14 },
  logoLeaf: {
    width: 44, height: 56,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    backgroundColor: GREEN, marginBottom: -8,
  },
  logoPinCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: GOLD, borderWidth: 3, borderColor: BG,
  },
  wordmark: { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: 1.5 },
  goldDivider: { marginTop: 10, width: 40, height: 2.5, borderRadius: 2, backgroundColor: GOLD },
  driverBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.28)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    color: GOLD, fontSize: 12, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Heading
  headingBlock: { marginBottom: 32 },
  heading:      { fontSize: 28, fontWeight: '700', color: WHITE, letterSpacing: 0.2 },
  subheading:   { fontSize: 15, color: MUTED, marginTop: 6 },

  // Form
  form: { marginBottom: 32 },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.70)', marginBottom: 8 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: WHITE, fontSize: 15,
  },
  inputFocused: { borderColor: GOLD },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  inputInner: {
    flex: 1, backgroundColor: 'transparent',
    borderWidth: 0, paddingHorizontal: 0,
  },
  eyeBtn: { padding: 4 },
  eyeText: { fontSize: 16 },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 13, lineHeight: 18 },

  signInBtn: {
    backgroundColor: GOLD, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
    justifyContent: 'center', marginTop: 6,
  },
  signInBtnDisabled: { opacity: 0.65 },
  signInText: { color: '#0a1a0f', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  legal: {
    color: 'rgba(255,255,255,0.20)', fontSize: 11,
    textAlign: 'center', lineHeight: 17,
  },
});
