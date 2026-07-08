import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventory.service';
import { DispensaryCard } from '@/components/dispensary/DispensaryCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { Dispensary } from '@/types';

const BG     = '#060f08';
const BORDER = 'rgba(255,255,255,0.10)';
const GOLD   = '#f59e0b';
const WHITE  = '#ffffff';
const MUTED  = 'rgba(255,255,255,0.45)';

export default function HomeScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dispensaries'],
    queryFn: () => InventoryService.getDispensaries({ limit: 20 }),
  });

  const dispensaries = data?.data ?? [];

  const filtered = search.trim()
    ? dispensaries.filter((d: Dispensary) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase()),
      )
    : dispensaries;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hi {user?.firstName ?? 'there'} 👋
          </Text>
          <Text style={styles.subGreeting}>Find cannabis delivered to your door</Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search dispensaries..."
              placeholderTextColor="rgba(255,255,255,0.28)"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner message="Finding dispensaries near you..." />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DispensaryCard
                dispensary={item}
                onPress={() => router.push(`/dispensary/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={GOLD}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🌿</Text>
                <Text style={styles.emptyTitle}>
                  {search ? 'No dispensaries found' : 'No dispensaries available'}
                </Text>
                <Text style={styles.emptyBody}>
                  {search ? 'Try a different search term' : "Check back soon — we're growing."}
                </Text>
              </View>
            }
          />
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#080f0a',
  },
  greeting:    { fontSize: 22, fontWeight: '700', color: WHITE },
  subGreeting: { fontSize: 13, color: MUTED, marginTop: 3 },

  searchBar: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  searchIcon:  { fontSize: 14, marginRight: 8, opacity: 0.55 },
  searchInput: { flex: 1, color: WHITE, fontSize: 14 },

  listContent: { padding: 16, paddingBottom: 32 },

  empty:      { alignItems: 'center', paddingVertical: 64 },
  emptyIcon:  { fontSize: 44, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: WHITE },
  emptyBody: {
    fontSize: 13, color: MUTED, marginTop: 6,
    textAlign: 'center', paddingHorizontal: 32, lineHeight: 20,
  },
});
