import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { routeApi } from '../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  SectionHeader,
} from '../components/UIComponents';
import { formatDate, formatDistance } from '../utils/helpers';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchRoutes = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await routeApi.list();
      setRoutes(res.data?.routes || res.data || []);
    } catch {
      setError('Could not load routes. Showing demo data.');
      setRoutes(DEMO_ROUTES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchRoutes(true); }, []);

  const filtered = routes.filter((r) =>
    [r.source, r.destination, r.name].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const renderRoute = ({ item }) => {
    const isOpen = expanded === item.id;
    return (
      <Card style={styles.routeCard}>
        <TouchableOpacity onPress={() => setExpanded(isOpen ? null : item.id)} activeOpacity={0.8}>
          <View style={styles.routeHeader}>
            <View style={styles.routeRoute}>
              <Text style={styles.routeSource}>{item.source || 'Origin'}</Text>
              <View style={styles.routeArrow}>
                <View style={styles.routeLine} />
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.routeDest}>{item.destination || 'Destination'}</Text>
            </View>
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
          </View>

          <View style={styles.routeMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="navigate-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatDistance(item.distance)}</Text>
            </View>
            {item.travelTime && (
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{item.travelTime}</Text>
              </View>
            )}
            {item.transportMode && (
              <View style={styles.metaChip}>
                <Ionicons name="bus-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{item.transportMode}</Text>
              </View>
            )}
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{formatDate(item.createdAt || item.date)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.routeDetails}>
            {item.estimatedFuel && (
              <View style={styles.detailRow}>
                <Ionicons name="water-outline" size={14} color={COLORS.warning} />
                <Text style={styles.detailLabel}>Est. Fuel</Text>
                <Text style={styles.detailVal}>{item.estimatedFuel} L</Text>
              </View>
            )}
            {item.tollCosts !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color={COLORS.success} />
                <Text style={styles.detailLabel}>Toll Cost</Text>
                <Text style={styles.detailVal}>₹{item.tollCosts}</Text>
              </View>
            )}
            {item.co2Emissions !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="leaf-outline" size={14} color={COLORS.success} />
                <Text style={styles.detailLabel}>CO₂ Emissions</Text>
                <Text style={styles.detailVal}>{item.co2Emissions} kg</Text>
              </View>
            )}
            {item.ecoTip && (
              <View style={styles.ecoTip}>
                <Text style={styles.ecoTipText}>💡 {item.ecoTip}</Text>
              </View>
            )}
            {item.itinerary?.length > 0 && (
              <View style={{ marginTop: SPACING.sm }}>
                <Text style={styles.itineraryTitle}>Itinerary</Text>
                {item.itinerary.map((step, i) => (
                  <Text key={i} style={styles.itineraryStep}>• {step}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </Card>
    );
  };

  if (loading && !refreshing) return <LoadingSpinner message="Loading routes..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search routes by source or destination..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {error ? <ErrorMessage message={error} style={{ marginHorizontal: SPACING.base, marginBottom: 0 }} /> : null}

      <FlatList
        data={filtered}
        renderItem={renderRoute}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={
          <EmptyState
            icon="map-outline"
            title="No routes found"
            subtitle="Plan a route using the AI Route Planner in the Explore tab"
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const DEMO_ROUTES = [
  {
    id: '1', source: 'Chennai', destination: 'Ooty', distance: 540,
    travelTime: '9h 30m', transportMode: 'Bus', estimatedFuel: 54,
    tollCosts: 320, co2Emissions: 126, createdAt: new Date().toISOString(),
    ecoTip: 'Taking the Coonoor route reduces distance by 30km.',
    itinerary: ['Start from Chennai Central', 'NH44 via Krishnagiri', 'Salem bypass', 'Mettupalayam Ghat road', 'Arrive Ooty'],
  },
  {
    id: '2', source: 'Chennai', destination: 'Kodaikanal', distance: 460,
    travelTime: '8h 00m', transportMode: 'Bus', estimatedFuel: 46,
    tollCosts: 280, co2Emissions: 108, createdAt: new Date().toISOString(),
    ecoTip: 'Early morning departure avoids toll peak hours.',
  },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { padding: SPACING.base },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, height: 40,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sm },
  routeCard: { marginBottom: SPACING.sm },
  routeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  routeRoute: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  routeSource: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  routeArrow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.sm, flex: 1 },
  routeLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  routeDest: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.base },
  routeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: RADIUS.sm },
  metaText: { color: COLORS.textMuted, fontSize: FONTS.xs },
  routeDetails: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  detailLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, flex: 1 },
  detailVal: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.sm },
  ecoTip: { backgroundColor: COLORS.successDim, borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.xs },
  ecoTipText: { color: COLORS.success, fontSize: FONTS.sm },
  itineraryTitle: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONTS.sm, marginBottom: SPACING.xs },
  itineraryStep: { color: COLORS.textPrimary, fontSize: FONTS.sm, marginBottom: 4 },
});
