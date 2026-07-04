import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '@/types';

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

const steps: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '🌿' },
  { key: 'in_transit', label: 'On the Way', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '📦' },
];

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered'];

function getStepIndex(status: OrderStatus): number {
  return statusOrder.indexOf(status);
}

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const currentIndex = getStepIndex(status);

  if (status === 'cancelled') {
    return (
      <View className="bg-red-50 rounded-xl p-4 items-center">
        <Text className="text-2xl">✕</Text>
        <Text className="text-base font-semibold text-red-700 mt-2">Order Cancelled</Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => {
          const stepOrder = getStepIndex(step.key);
          const isComplete = stepOrder <= currentIndex;
          const isActive = stepOrder === currentIndex;

          return (
            <React.Fragment key={step.key}>
              {/* Step circle */}
              <View className="items-center flex-1">
                <View
                  className={[
                    'w-10 h-10 rounded-full items-center justify-center',
                    isComplete ? 'bg-brand-900' : 'bg-neutral-200',
                    isActive ? 'ring-2 ring-brand-400' : '',
                  ].join(' ')}
                >
                  <Text className={['text-base', isComplete ? 'text-white' : 'text-neutral-400'].join(' ')}>
                    {step.icon}
                  </Text>
                </View>
                <Text
                  className={[
                    'text-xs mt-1.5 text-center',
                    isComplete ? 'text-brand-900 font-medium' : 'text-neutral-400',
                  ].join(' ')}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <View
                  className={[
                    'h-0.5 flex-1 mb-6',
                    getStepIndex(steps[index + 1].key) <= currentIndex
                      ? 'bg-brand-900'
                      : 'bg-neutral-200',
                  ].join(' ')}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
