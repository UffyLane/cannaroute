import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';

export default function DriverAccountScreen() {
  const { driver, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
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
        {/* Profile */}
        <View className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-brand-800 items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">
                {driver?.firstName?.[0] ?? '?'}
              </Text>
            </View>
            <View>
              <Text className="text-lg font-semibold text-neutral-900">
                {driver?.firstName} {driver?.lastName}
              </Text>
              <Text className="text-sm text-neutral-500">{driver?.email}</Text>
              <Text className="text-xs text-neutral-400 mt-0.5">
                {driver?.totalDeliveries ?? 0} deliveries completed
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle info */}
        <View className="bg-white rounded-2xl p-5 border border-neutral-100 mb-4">
          <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Vehicle
          </Text>
          <Text className="text-sm font-semibold text-neutral-900">
            {driver?.vehicleYear} {driver?.vehicleMake} {driver?.vehicleModel}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1">
            License: {driver?.licenseNumber}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-red-50 border border-red-100 rounded-2xl p-4 items-center"
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text className="text-red-600 font-semibold text-sm">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
