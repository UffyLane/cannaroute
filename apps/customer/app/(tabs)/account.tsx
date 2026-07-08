import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

const BG      = '#060f08';
const SURFACE = 'rgba(255,255,255,0.05)';
const BORDER  = 'rgba(255,255,255,0.10)';
const GREEN   = '#0f4c35';
const GOLD    = '#f59e0b';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(255,255,255,0.45)';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  last?: boolean;
}

function MenuRow({ icon, label, onPress, destructive = false, last = false }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !last && styles.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { user, logout } = useAuth();

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
                  {user?.firstName?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                {user?.isMedical && (
                  <View style={{ marginTop: 8 }}>
                    <Badge label="Medical Patient" variant="success" />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Account section */}
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionLabel}>Account</Text>
            <MenuRow icon="📋" label="Order History"    onPress={() => {}} />
            <MenuRow icon="📍" label="Saved Addresses"  onPress={() => {}} />
            <MenuRow icon="💳" label="Payment Methods"  onPress={() => {}} />
            <MenuRow icon="🏥" label="Medical Card"     onPress={() => {}} last />
          </View>

          {/* Support section */}
          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionLabel}>Support</Text>
            <MenuRow icon="❓" label="Help Center"       onPress={() => {}} />
            <MenuRow icon="📄" label="Terms of Service" onPress={() => {}} />
            <MenuRow icon="🔒" label="Privacy Policy"   onPress={() => {}} last />
          </View>

          {/* Sign out */}
          <View style={[styles.card, { marginTop: 12, marginBottom: 36 }]}>
            <MenuRow icon="🚪" label="Sign Out" onPress={handleLogout} destructive last />
          </View>
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
    borderBottomColor: BORDER,
    backgroundColor: '#080f0a',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: WHITE },

  scroll: { flex: 1, paddingHorizontal: 16 },

  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  profileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  avatarLetter: { color: WHITE, fontSize: 22, fontWeight: '700' },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 16, fontWeight: '600', color: WHITE },
  profileEmail: { fontSize: 13, color: MUTED, marginTop: 3 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 1.2,
    paddingTop: 12, paddingBottom: 4,
  },

  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon:              { fontSize: 16 },
  menuLabel:             { flex: 1, fontSize: 14, fontWeight: '500', color: WHITE },
  menuLabelDestructive:  { color: '#f87171' },
  menuChevron:           { fontSize: 18, color: 'rgba(255,255,255,0.25)', fontWeight: '300' },
});
