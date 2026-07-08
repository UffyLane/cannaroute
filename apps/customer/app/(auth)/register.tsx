import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });
  const [step, setStep] = useState<1 | 2>(1);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const goToStep2 = () => {
    const { firstName, lastName, email } = form;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      shake();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      shake();
      return;
    }
    Animated.timing(slideAnim, { toValue: -1, duration: 250, useNativeDriver: true }).start(() => {
      setStep(2);
      slideAnim.setValue(1);
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goBack = () => {
    Animated.timing(slideAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => {
      setStep(1);
      slideAnim.setValue(-1);
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    });
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, dateOfBirth } = form;
    if (!password || !dateOfBirth) { shake(); return; }
    if (password.length < 8) { shake(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) { shake(); return; }
    try {
      clearError();
      await register({ firstName, lastName, email: email.trim().toLowerCase(), password, dateOfBirth });
      router.replace('/(tabs)');
    } catch {
      shake();
    }
  };

  const slideX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-300, 0, 300],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Decorative circles */}
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
            {/* ── Logo ────────────────────────────────────────────────────── */}
            <View style={styles.logoBlock}>
              <View style={styles.logoIconWrap}>
                <View style={styles.logoLeaf} />
                <View style={styles.logoPinCircle} />
              </View>
              <Text style={styles.wordmark}>CannaRoute</Text>
              <View style={styles.goldDivider} />
            </View>

            {/* ── Step indicator ──────────────────────────────────────────── */}
            <View style={styles.stepRow}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step === 1 ? styles.stepDotActive : styles.stepDotDone]}>
                  <Text style={styles.stepDotText}>{step > 1 ? '✓' : '1'}</Text>
                </View>
                <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
                  Your Info
                </Text>
              </View>
              <View style={[styles.stepConnector, step === 2 && styles.stepConnectorActive]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, step === 2 ? styles.stepDotActive : styles.stepDotInactive]}>
                  <Text style={styles.stepDotText}>2</Text>
                </View>
                <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
                  Security
                </Text>
              </View>
            </View>

            {/* ── Heading ─────────────────────────────────────────────────── */}
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>
                {step === 1 ? 'Create your account' : 'Secure your account'}
              </Text>
              <Text style={styles.subheading}>
                {step === 1
                  ? 'Get premium cannabis delivered to your door'
                  : 'Set a strong password and verify your age'}
              </Text>
            </View>

            {/* ── Form (animated slide) ────────────────────────────────────── */}
            <Animated.View
              style={[styles.form, { transform: [{ translateX: shakeAnim }, { translateX: slideX }] }]}
            >
              {step === 1 ? (
                <>
                  {/* Step 1: Name + Email */}
                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Input
                        label="First name"
                        placeholder="Jane"
                        value={form.firstName}
                        onChangeText={set('firstName')}
                        autoComplete="given-name"
                        theme="dark"
                      />
                    </View>
                    <View style={styles.halfField}>
                      <Input
                        label="Last name"
                        placeholder="Doe"
                        value={form.lastName}
                        onChangeText={set('lastName')}
                        autoComplete="family-name"
                        theme="dark"
                      />
                    </View>
                  </View>

                  <Input
                    label="Email address"
                    placeholder="you@example.com"
                    value={form.email}
                    onChangeText={set('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    theme="dark"
                  />

                  {error ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <Button
                    label="Continue"
                    onPress={goToStep2}
                    variant="gold"
                    fullWidth
                    size="lg"
                    style={styles.cta}
                  />
                </>
              ) : (
                <>
                  {/* Step 2: Password + DOB */}
                  <Input
                    label="Password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChangeText={set('password')}
                    isPassword
                    hint="Use letters, numbers, and a special character"
                    theme="dark"
                  />

                  <Input
                    label="Date of birth"
                    placeholder="YYYY-MM-DD"
                    value={form.dateOfBirth}
                    onChangeText={set('dateOfBirth')}
                    keyboardType="numeric"
                    theme="dark"
                  />

                  {/* Age notice */}
                  <View style={styles.ageNotice}>
                    <Text style={styles.ageIcon}>🔞</Text>
                    <Text style={styles.ageText}>
                      You must be 21 or older to use CannaRoute. Your age is verified at delivery.
                    </Text>
                  </View>

                  {error ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <Button
                    label="Create Account"
                    onPress={handleRegister}
                    isLoading={isLoading}
                    variant="gold"
                    fullWidth
                    size="lg"
                    style={styles.cta}
                  />

                  <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.legalText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              Cannabis delivery is subject to local laws and regulations.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const BG    = '#060f08';
const GREEN = '#0f4c35';
const GOLD  = '#f59e0b';
const WHITE = '#ffffff';
const MUTED = 'rgba(255,255,255,0.45)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  bgCircle1: {
    position: 'absolute', top: -100, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(15,76,53,0.30)',
  },
  bgCircle2: {
    position: 'absolute', top: 280, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  bgCircle3: {
    position: 'absolute', bottom: -60, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(15,76,53,0.18)',
  },

  safe: { flex: 1 },
  kav:  { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 48 },

  // Logo
  logoBlock: { alignItems: 'center', paddingTop: 40, marginBottom: 28 },
  logoIconWrap: { alignItems: 'center', marginBottom: 12 },
  logoLeaf: {
    width: 38, height: 48,
    borderTopLeftRadius: 19, borderTopRightRadius: 19,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: GREEN, marginBottom: -7,
  },
  logoPinCircle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: GOLD, borderWidth: 3, borderColor: BG,
  },
  wordmark: { fontSize: 28, fontWeight: '800', color: WHITE, letterSpacing: 1.5 },
  goldDivider: { marginTop: 8, width: 36, height: 2.5, borderRadius: 2, backgroundColor: GOLD },

  // Steps
  stepRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, gap: 0,
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepConnector: { width: 60, height: 1.5, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8, marginBottom: 20 },
  stepConnectorActive: { backgroundColor: GOLD },
  stepDot: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive:   { backgroundColor: GOLD },
  stepDotDone:     { backgroundColor: GREEN, borderWidth: 1.5, borderColor: GOLD },
  stepDotInactive: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.20)' },
  stepDotText: { color: WHITE, fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 11, color: MUTED, fontWeight: '500' },
  stepLabelActive: { color: GOLD },

  // Heading
  headingBlock: { marginBottom: 28 },
  heading:      { fontSize: 26, fontWeight: '700', color: WHITE, letterSpacing: 0.2 },
  subheading:   { fontSize: 14, color: MUTED, marginTop: 6, lineHeight: 20 },

  // Form
  form: { marginBottom: 24 },
  row:  { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  cta: { marginTop: 6 },
  backBtn: { alignSelf: 'center', marginTop: 16, padding: 8 },
  backText: { color: MUTED, fontSize: 14, fontWeight: '600' },

  // Age notice
  ageNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.20)',
    borderRadius: 12, padding: 14, marginBottom: 18,
  },
  ageIcon: { fontSize: 16, marginTop: 1 },
  ageText: { flex: 1, color: 'rgba(245,158,11,0.85)', fontSize: 13, lineHeight: 18 },

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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 28 },
  footerText: { color: MUTED, fontSize: 14 },
  footerLink: { color: GOLD, fontSize: 14, fontWeight: '700' },

  // Legal
  legalText: {
    color: 'rgba(255,255,255,0.20)', fontSize: 11,
    textAlign: 'center', lineHeight: 16,
  },
});
