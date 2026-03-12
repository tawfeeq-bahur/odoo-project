import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { Card, StatusBadge, SectionHeader } from '../components/UIComponents';

const FUEL_COLOR = (v) => {
  if (v >= 60) return COLORS.success;
  if (v >= 30) return COLORS.warning;
  return COLORS.danger;
};

const SPEC_ROWS = [
  { key: 'regNumber', label: 'Registration', icon: 'card-outline' },
  { key: 'model', label: 'Model', icon: 'car-outline' },
  { key: 'type', label: 'Type', icon: 'bus-outline' },
  { key: 'assignedTo', label: 'Assigned To', icon: 'person-outline' },
  { key: 'lastMaintenance', label: 'Last Service', icon: 'build-outline' },
  { key: 'nextService', label: 'Next Service', icon: 'calendar-outline' },
  { key: 'capacity', label: 'Capacity', icon: 'people-outline' },
  { key: 'mileage', label: 'Total Mileage', icon: 'speedometer-outline' },
];

export default function VehicleDetailScreen({ route, navigation }) {
  const vehicle = route.params?.vehicle || {};
  const fuel = vehicle.fuelLevel ?? 75;
  const fuelClr = FUEL_COLOR(fuel);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.vehicleIconLarge}>
            <Ionicons name="bus" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.vehicleName}>{vehicle.regNumber || vehicle.registration_number || 'Vehicle'}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
          <View style={{ marginTop: SPACING.sm }}>
            <StatusBadge status={vehicle.status || 'active'} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Fuel Level */}
          <Card style={styles.card}>
            <SectionHeader title="⛽ Fuel Level" />
            <View style={styles.fuelRow}>
              <Text style={[styles.fuelPercent, { color: fuelClr }]}>{fuel}%</Text>
              <Text style={[styles.fuelStatus, { color: fuelClr }]}>
                {fuel >= 60 ? 'Good' : fuel >= 30 ? 'Low' : 'Critical — Refuel Required'}
              </Text>
            </View>
            <View style={styles.fuelBarBg}>
              <View style={[styles.fuelBarFill, { width: `${fuel}%`, backgroundColor: fuelClr }]} />
            </View>
          </Card>

          {/* Specs */}
          <Card style={styles.card}>
            <SectionHeader title="🔧 Specifications" />
            {SPEC_ROWS.map((row) => vehicle[row.key] ? (
              <View key={row.key} style={styles.specRow}>
                <View style={styles.specLabel}>
                  <Ionicons name={row.icon} size={14} color={COLORS.textMuted} />
                  <Text style={styles.specLabelText}>{row.label}</Text>
                </View>
                <Text style={styles.specVal}>{vehicle[row.key]}</Text>
              </View>
            ) : null)}
            {SPEC_ROWS.every((r) => !vehicle[r.key]) && (
              <Text style={styles.noData}>No additional specifications available.</Text>
            )}
          </Card>

          {/* Documents */}
          <Card style={styles.card}>
            <SectionHeader title="📄 Documents" subtitle="Insurance, RC Book, Fitness Certificate" />
            {['Insurance', 'RC Book', 'Fitness Cert', 'PUC Certificate'].map((doc) => (
              <View key={doc} style={styles.docRow}>
                <View style={styles.docIcon}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.docName}>{doc}</Text>
                <View style={styles.docBadge}>
                  <Text style={styles.docBadgeText}>Valid</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.warningDim }]}
              onPress={() => navigation.navigate('Odometer')}
            >
              <Ionicons name="speedometer-outline" size={22} color={COLORS.warning} />
              <Text style={[styles.actionLabel, { color: COLORS.warning }]}>Odometer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primaryDim }]}
              onPress={() => navigation.navigate('VehicleHealth')}
            >
              <Ionicons name="medical-outline" size={22} color={COLORS.primary} />
              <Text style={[styles.actionLabel, { color: COLORS.primary }]}>Health Check</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.successDim }]}
              onPress={() => navigation.navigate('TripSummary')}
            >
              <Ionicons name="map-outline" size={22} color={COLORS.success} />
              <Text style={[styles.actionLabel, { color: COLORS.success }]}>Trips</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    backgroundColor: COLORS.surface, padding: SPACING.xl,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  vehicleIconLarge: {
    width: 100, height: 100, borderRadius: RADIUS['2xl'],
    backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  vehicleName: { color: COLORS.textPrimary, fontSize: FONTS.xl, fontWeight: '800' },
  vehicleModel: { color: COLORS.textSecondary, marginTop: 4 },
  content: { padding: SPACING.base },
  card: { marginBottom: SPACING.md },
  fuelRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm, marginBottom: SPACING.xs },
  fuelPercent: { fontSize: FONTS['2xl'], fontWeight: '800' },
  fuelStatus: { fontSize: FONTS.sm, fontWeight: '600' },
  fuelBarBg: { height: 10, backgroundColor: COLORS.border, borderRadius: 5 },
  fuelBarFill: { height: 10, borderRadius: 5 },
  specRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  specLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specLabelText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  specVal: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm, maxWidth: '60%', textAlign: 'right' },
  noData: { color: COLORS.textMuted, fontSize: FONTS.sm, fontStyle: 'italic' },
  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  docIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  docName: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sm },
  docBadge: { backgroundColor: COLORS.successDim, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  docBadgeText: { color: COLORS.success, fontSize: FONTS.xs, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', gap: SPACING.xs,
  },
  actionLabel: { fontSize: FONTS.xs, fontWeight: '700' },
});
