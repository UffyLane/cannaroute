import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const { width: SCREEN_W } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      shake();
      return;
    }
    try {
      clearError();
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('/(tabs)');
    } catch {
      shake();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Decorative background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

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
            {/* ── Logo / Wordmark ─────────────────────────────────────────── */}
            <View style={styles.logoBlock}>
              {/* Leaf icon (drawn with borders — no image dep) */}
              <View style={styles.logoIconWrap}>
                <View style={styles.logoLeaf} />
                <View style={styles.logoPinCircle} />
              </View>
              <Text style={styles.wordmark}>CannaRoute</Text>
              <View style={styles.goldDivider} />
            </View>

            {/* ── Heading ─────────────────────────────────────────────────── */}
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>Sign in to continue</Text>
            </View>

            {/* ── Form ────────────────────────────────────────────────────── */}
            <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
              <Input
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                theme="dark"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                theme="dark"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button
                label="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                variant="gold"
                fullWidth
                size="lg"
                style={styles.cta}
              />
            </Animated.View>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={styles.footerLink}>Create one</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legalText}>
              By continuing, you confirm you are 21 or older and agree to our Terms of Service and
              Privacy Policy.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const BG       = '#060f08';
const BG2      = '#0a1a0f';
const CARD     = 'rgba(255,255,255,0.05)';
const GOLD     = '#f59e0b';
const GOLD_DIM = 'rgba(245,158,11,0.15)';
const GREEN    = '#0f4c35';
const WHITE    = '#ffffff';
const MUTED    = 'rgba(255,255,255,0.45)';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // Decorative blurred circles (pure background colour, no blur dep)
  bgCircle1: {
    position: 'absolute', top: -120, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(15,76,53,0.35)',
  },
  bgCircle2: {
    position: 'absolute', top: 200, left: -100,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  bgCircle3: {
    position: 'absolute', bottom: -80, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(15,76,53,0.20)',
  },

  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 48 },

  // Logo block
  logoBlock: { alignItems: 'center', paddingTop: 52, marginBottom: 40 },
  logoIconWrap: { alignItems: 'center', marginBottom: 14 },
  logoLeaf: {
    width: 44, height: 56,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    backgroundColor: GREEN,
    marginBottom: -8,
  },
  logoPinCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: GOLD,
    borderWidth: 3, borderColor: BG,
  },
  wordmark: {
    fontSize: 32, fontWeight: '800', color: WHITE,
    letterSpacing: 1.5,
  },
  goldDivider: {
    marginTop: 10, width: 40, height: 2.5,
    borderRadius: 2, backgroundColor: GOLD,
  },

  // Heading
  headingBlock: { marginBottom: 32 },
  heading:      { fontSize: 28, fontWeight: '700', color: WHITE, letterSpacing: 0.2 },
  subheading:   { fontSize: 15, color: MUTED, marginTop: 6 },

  // Form
  form: { marginBottom: 24 },
  cta:  { marginTop: 8 },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 13, lineHeight: 18 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerText: { color: MUTED, fontSize: 13, paddingHorizontal: 14 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 32 },
  footerText: { color: MUTED, fontSize: 14 },
  footerLink: { color: GOLD, fontSize: 14, fontWeight: '700' },

  // Legal
  legalText: {
    color: 'rgba(255,255,255,0.22)', fontSize: 11,
    textAlign: 'center', lineHeight: 16,
  },
});
