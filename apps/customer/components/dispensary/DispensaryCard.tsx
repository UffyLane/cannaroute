import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Dispensary } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface DispensaryCardProps {
  dispensary: Dispensary;
  onPress: () => void;
}

export function DispensaryCard({ dispensary, onPress }: DispensaryCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} className="mb-3">
      <Card padded={false} elevated>
        {/* Cover image */}
        <View className="h-36 bg-brand-100 rounded-t-2xl overflow-hidden">
          {dispensary.logoUrl ? (
            <Image
              source={{ uri: dispensary.logoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl">🌿</Text>
            </View>
          )}
          {/* Open / Closed chip */}
          <View className="absolute top-3 right-3">
            <Badge
              label={dispensary.isOpen ? 'Open' : 'Closed'}
              variant={dispensary.isOpen ? 'success' : 'error'}
            />
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          <Text className="text-base font-semibold text-neutral-900">{dispensary.name}</Text>
          <Text className="text-sm text-neutral-500 mt-0.5">
            {dispensary.city}, {dispensary.state}
          </Text>

          <View className="flex-row items-center mt-3 gap-x-4">
            {/* Rating */}
            <View className="flex-row items-center">
              <Text className="text-amber-500 text-sm">★</Text>
              <Text className="text-sm font-medium text-neutral-700 ml-1">
                {dispensary.rating.toFixed(1)}
              </Text>
              <Text className="text-xs text-neutral-400 ml-1">({dispensary.reviewCount})</Text>
            </View>

            {/* Distance */}
            {dispensary.distanceMiles !== undefined && (
              <Text className="text-sm text-neutral-500">
                {dispensary.distanceMiles.toFixed(1)} mi
              </Text>
            )}

            {/* Delivery time */}
            {dispensary.deliveryAvailable && (
              <Text className="text-sm text-neutral-500">
                ~{dispensary.estimatedDeliveryMinutes} min
              </Text>
            )}
          </View>

          {/* Delivery fee / min order */}
          {dispensary.deliveryAvailable && (
            <View className="flex-row items-center mt-2 gap-x-3">
              <Text className="text-xs text-neutral-400">
                ${dispensary.deliveryFee.toFixed(2)} delivery
              </Text>
              <Text className="text-xs text-neutral-400">•</Text>
              <Text className="text-xs text-neutral-400">
                ${dispensary.minOrderAmount} min
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
