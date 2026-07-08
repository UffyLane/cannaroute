import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth.store';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

export default function DriverAccountScreen() {
  const { driver, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {driver?.firstName?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {driver?.firstName} {driver?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{driver?.email}</Text>
                <Text style={styles.profileDeliveries}>
                  {driver?.totalDeliveries ?? 0} deliveries completed
                </Text>
              </View>
            </View>
          </View>

          {/* Earnings summary */}
          <View style={[styles.statsRow]}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{driver?.totalDeliveries ?? 0}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: GOLD }]}>
                ${((driver?.totalDeliveries ?? 0) * 12.5).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Est. Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#4ade80' }]}>
                {driver?.isOnline ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Vehicle info */}
          <View style={[styles.card, { marginTop: 0 }]}>
            <Text style={styles.sectionLabel}>Vehicle</Text>
            <Text style={styles.vehicleModel}>
              {driver?.vehicleYear} {driver?.vehicleMake} {driver?.vehicleModel}
            </Text>
            <Text style={styles.vehicleLicense}>
              License: {driver?.licenseNumber}
            </Text>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#080f0a',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: WHITE },

  scroll: { flex: 1, paddingHorizontal: 16 },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
  },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarLetter:      { color: WHITE, fontSize: 24, fontWeight: '700' },
  profileInfo:       { flex: 1 },
  profileName:       { fontSize: 16, fontWeight: '700', color: WHITE },
  profileEmail:      { fontSize: 13, color: MUTED, marginTop: 3 },
  profileDeliveries: { fontSize: 12, color: 'rgba(245,158,11,0.70)', marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: WHITE },
  statLabel: { fontSize: 11, color: MUTED, marginTop: 4 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
  },
  vehicleModel:   { fontSize: 15, fontWeight: '600', color: WHITE },
  vehicleLicense: { fontSize: 13, color: MUTED, marginTop: 6 },

  signOutBtn: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 36,
  },
  signOutText: { fontSize: 14, fontWeight: '600', color: '#f87171' },
});
