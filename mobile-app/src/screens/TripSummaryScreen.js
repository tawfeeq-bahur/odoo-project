import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tripApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  StatusBadge,
} from '../components/UIComponents';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function TripSummaryScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchTrips = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await tripApi.getAll();
      setTrips(res.data?.trips || res.data || []);
    } catch {
      setError('Could not load trip data. Showing demo.');
      setTrips(DEMO_TRIPS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchTrips(true); }, []);

  const filtered = trips.filter((t) =>
    [t.name, t.destination, t.employeeName, t.vehicleReg].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const stats = {
    total: trips.length,
    ongoing: trips.filter((t) => t.status === 'ongoing').length,
    completed: trips.filter((t) => t.status === 'completed').length,
    totalExpenses: trips.reduce((s, t) => s + (t.totalExpenses || 0), 0),
  };

  const renderTrip = ({ item }) => {
    const fuel = item.fuelUsed ?? null;
    return (
      <Card style={styles.tripCard}>
        <View style={styles.tripTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tripName}>{item.name || item.destination}</Text>
            <Text style={styles.tripDate}>{formatDate(item.startDate)} → {formatDate(item.endDate)}</Text>
          </View>
          <StatusBadge status={item.status || 'planned'} />
        </View>

        {/* Employee + Vehicle row */}
        <View style={styles.tripInfo}>
          {item.employeeName && (
            <View style={styles.infoChip}>
              <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.employeeName}</Text>
            </View>
          )}
          {item.vehicleReg && (
            <View style={styles.infoChip}>
              <Ionicons name="bus-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.vehicleReg}</Text>
            </View>
          )}
          {item.routeName && (
            <View style={styles.infoChip}>
              <Ionicons name="map-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.routeName}</Text>
            </View>
          )}
        </View>

        <View style={styles.tripFooter}>
          {fuel !== null && (
            <View style={styles.fuelItem}>
              <Text style={styles.fuelLabel}>Fuel: {fuel}%</Text>
              <View style={styles.fuelBarBg}>
                <View style={[styles.fuelBarFill, {
                  width: `${fuel}%`,
                  backgroundColor: fuel >= 60 ? COLORS.success : fuel >= 30 ? COLORS.warning : COLORS.danger,
                }]} />
              </View>
            </View>
          )}
          <Text style={styles.expenseTotal}>₹{(item.totalExpenses || 0).toLocaleString()}</Text>
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) return <LoadingSpinner message="Loading trips..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Summary stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: COLORS.success }]}>{stats.ongoing}</Text>
          <Text style={styles.statLabel}>Ongoing</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: COLORS.textMuted }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: COLORS.warning, fontSize: FONTS.sm }]}>
            ₹{(stats.totalExpenses / 1000).toFixed(1)}k
          </Text>
          <Text style={styles.statLabel}>Spend</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search trips..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {error ? <ErrorMessage message={error} style={{ marginHorizontal: SPACING.base, marginBottom: 0 }} /> : null}

      <FlatList
        data={filtered}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={<EmptyState icon="map-outline" title="No trips" subtitle="Trip data will appear here" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const DEMO_TRIPS = [
  {
    id: '1', name: 'Ooty Educational Trip', destination: 'Ooty', status: 'ongoing',
    startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(),
    employeeName: 'Ravi Kumar', vehicleReg: 'TN01AB1234', routeName: 'Chennai → Ooty',
    fuelUsed: 62, totalExpenses: 14500,
  },
  {
    id: '2', name: 'Kodaikanal Weekend', destination: 'Kodaikanal', status: 'planned',
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(), endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    employeeName: 'Priya Nair', vehicleReg: 'TN03EF9012', routeName: 'Chennai → Kodaikanal',
    fuelUsed: null, totalExpenses: 0,
  },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  statsRow: { flexDirection: 'row', padding: SPACING.base, gap: SPACING.xs },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statVal: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.lg },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 2 },
  searchWrap: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xs },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, height: 40,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sm },
  tripCard: { marginBottom: SPACING.sm },
  tripTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  tripName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base, marginBottom: 2 },
  tripDate: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  tripInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.xs, paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  infoText: { color: COLORS.textMuted, fontSize: FONTS.xs },
  tripFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  fuelItem: { flex: 1 },
  fuelLabel: { color: COLORS.textMuted, fontSize: FONTS.xs, marginBottom: 3 },
  fuelBarBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3 },
  fuelBarFill: { height: 5, borderRadius: 3 },
  expenseTotal: { color: COLORS.warning, fontWeight: '700', fontSize: FONTS.sm },
});
