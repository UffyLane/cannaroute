import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Config } from '@/constants/config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [confirmed, setConfirmed] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const toggleConfirm = () => {
    const next = !confirmed;
    setConfirmed(next);
    Animated.spring(checkAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      bounciness: 12,
    }).start();
  };

  const handleConfirm = () => {
    if (!confirmed) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
      ]).start();
      return;
    }
    router.push('/(auth)/login');
  };

  const handleUnderAge = () => {
    Alert.alert(
      'Access Denied',
      `CannaRoute is only available to adults ${Config.minimumAge} and older.`,
      [{ text: 'Understood' }],
    );
  };

  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const checkOpacity = checkAnim;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* ── Hero section ────────────────────────────────────────────────── */}
          <View style={styles.hero}>
            {/* Icon mark */}
            <View style={styles.iconWrap}>
              <View style={styles.iconBg}>
                <View style={styles.leafShape} />
                <View style={styles.pinDot} />
              </View>
            </View>

            <Text style={styles.wordmark}>CannaRoute</Text>
            <View style={styles.goldBar} />
            <Text style={styles.tagline}>Premium Cannabis Delivery</Text>

            {/* Feature pills */}
            <View style={styles.pillRow}>
              {['Farm-to-Door', 'Lab-Tested', 'Fast Delivery'].map((t) => (
                <View key={t} style={styles.pill}>
                  <Text style={styles.pillText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Age gate card ────────────────────────────────────────────────── */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Age Verification</Text>
              <View style={styles.cardTitleUnderline} />
            </View>

            <Text style={styles.cardBody}>
              Cannabis products are for adults only. You must be{' '}
              <Text style={styles.highlight}>{Config.minimumAge} or older</Text> to access
              CannaRoute. Your age will be verified at delivery.
            </Text>

            {/* Checkbox */}
            <TouchableOpacity
              onPress={toggleConfirm}
              style={styles.checkRow}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkOpacity }}>
                  <Text style={styles.checkMark}>✓</Text>
                </Animated.View>
              </View>
              <Text style={styles.checkLabel}>
                I confirm I am <Text style={styles.highlight}>{Config.minimumAge} years or older</Text>
              </Text>
            </TouchableOpacity>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.85}
              style={[styles.ctaBtn, confirmed ? styles.ctaBtnActive : styles.ctaBtnInactive]}
            >
              <Text style={[styles.ctaText, confirmed ? styles.ctaTextActive : styles.ctaTextInactive]}>
                Enter CannaRoute
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleUnderAge} style={styles.underageBtn}>
              <Text style={styles.underageText}>I am under {Config.minimumAge}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Legal footer ─────────────────────────────────────────────────── */}
          <Text style={styles.legal}>
            By entering, you agree to our Terms of Service and Privacy Policy.{'\n'}
            Cannabis delivery is subject to local and state laws.
          </Text>
        </View>
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

  // Background circles
  circle1: {
    position: 'absolute', top: -140, right: -80,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: 'rgba(15,76,53,0.38)',
  },
  circle2: {
    position: 'absolute', top: SCREEN_H * 0.35, left: -100,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  circle3: {
    position: 'absolute', bottom: -60, right: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(15,76,53,0.22)',
  },

  safe: { flex: 1 },
  container: {
    flex: 1, paddingHorizontal: 28,
    justifyContent: 'space-between', paddingTop: 32, paddingBottom: 24,
  },

  // Hero
  hero: { alignItems: 'center' },
  iconWrap: { marginBottom: 20 },
  iconBg: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: 'rgba(15,76,53,0.60)',
    borderWidth: 1, borderColor: 'rgba(15,76,53,0.80)',
    alignItems: 'center', justifyContent: 'center',
  },
  leafShape: {
    width: 38, height: 48,
    borderTopLeftRadius: 19, borderTopRightRadius: 19,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: WHITE, marginBottom: -8,
  },
  pinDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: GOLD, borderWidth: 3, borderColor: 'rgba(6,15,8,0.4)',
  },
  wordmark: {
    fontSize: 38, fontWeight: '800', color: WHITE,
    letterSpacing: 2, marginBottom: 10,
  },
  goldBar: {
    width: 48, height: 3, borderRadius: 2,
    backgroundColor: GOLD, marginBottom: 10,
  },
  tagline: {
    fontSize: 14, color: 'rgba(245,158,11,0.80)',
    letterSpacing: 2, fontWeight: '600', textTransform: 'uppercase',
    marginBottom: 22,
  },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: 'rgba(15,76,53,0.50)',
    borderWidth: 1, borderColor: 'rgba(15,76,53,0.80)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  pillText: { color: 'rgba(255,255,255,0.70)', fontSize: 12, fontWeight: '500' },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24, padding: 24,
  },
  cardHeader: { marginBottom: 14 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
  cardTitleUnderline: {
    marginTop: 6, width: 32, height: 2.5,
    borderRadius: 2, backgroundColor: GOLD,
  },
  cardBody: {
    color: MUTED, fontSize: 14, lineHeight: 22, marginBottom: 20,
  },
  highlight: { color: GOLD, fontWeight: '700' },

  // Checkbox
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  checkbox: {
    width: 26, height: 26, borderRadius: 7,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, backgroundColor: 'transparent',
  },
  checkboxChecked: { backgroundColor: GOLD, borderColor: GOLD },
  checkMark: { color: '#0a1a0f', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  checkLabel: { flex: 1, color: 'rgba(255,255,255,0.80)', fontSize: 14, lineHeight: 20 },

  // CTA
  ctaBtn: {
    borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginBottom: 12,
  },
  ctaBtnActive:   { backgroundColor: GOLD, borderColor: GOLD },
  ctaBtnInactive: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.15)' },
  ctaText:              { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  ctaTextActive:   { color: '#0a1a0f' },
  ctaTextInactive: { color: 'rgba(255,255,255,0.30)' },

  // Under age
  underageBtn: { alignItems: 'center', paddingVertical: 8 },
  underageText: { color: 'rgba(255,255,255,0.30)', fontSize: 13 },

  // Legal
  legal: {
    color: 'rgba(255,255,255,0.20)', fontSize: 11,
    textAlign: 'center', lineHeight: 17,
  },
});
