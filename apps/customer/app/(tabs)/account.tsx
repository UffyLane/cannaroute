import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuRow({ icon, label, onPress, destructive = false }: MenuRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-neutral-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text
        className={['flex-1 text-sm font-medium', destructive ? 'text-red-500' : 'text-neutral-800'].join(' ')}
      >
        {label}
      </Text>
      <Text className="text-neutral-300 text-base">›</Text>
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
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-neutral-100">
        <Text className="text-2xl font-bold text-neutral-900">Account</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Profile card */}
        <Card>
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-brand-900 items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-sm text-neutral-500 mt-0.5">{user?.email}</Text>
              {user?.isMedical && (
                <View className="mt-1.5">
                  <Badge label="Medical Patient" variant="success" />
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Menu sections */}
        <Card style={{ marginTop: 12 }}>
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
            Account
          </Text>
          <MenuRow icon="📋" label="Order History" onPress={() => {}} />
          <MenuRow icon="📍" label="Saved Addresses" onPress={() => {}} />
          <MenuRow icon="💳" label="Payment Methods" onPress={() => {}} />
          <MenuRow icon="🏥" label="Medical Card" onPress={() => {}} />
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
            Support
          </Text>
          <MenuRow icon="❓" label="Help Center" onPress={() => {}} />
          <MenuRow icon="📄" label="Terms of Service" onPress={() => {}} />
          <MenuRow icon="🔒" label="Privacy Policy" onPress={() => {}} />
        </Card>

        <Card style={{ marginTop: 12, marginBottom: 32 }}>
          <MenuRow icon="🚪" label="Sign Out" onPress={handleLogout} destructive />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
