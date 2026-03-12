import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { aiApi } from '../services/api';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import {
  PrimaryButton,
  OutlineButton,
  Card,
  SectionHeader,
  LoadingSpinner,
  ErrorMessage,
} from '../components/UIComponents';
import AppTextInput from '../components/AppTextInput';
import { ROUTE_TYPES, TRAFFIC_LEVELS, TRANSPORT_MODES } from '../utils/constants';

export default function PlanRouteScreen({ navigation }) {
  const { user } = useAuth();
  const { addTrip, packages } = useAppState();

  const [form, setForm] = useState({
    source: '',
    destination: '',
    vehicleModel: '',
    routeType: 'fastest',
    traffic: 'moderate',
    avgSpeed: '60',
    maxSpeed: '100',
    durationDays: '1',
    transportMode: 'car',
    packageId: '',
  });

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [attractions, setAttractions] = useState([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePlan = async () => {
    if (!form.source.trim() || !form.destination.trim()) {
      Alert.alert('Required', 'Source and destination are required.');
      return;
    }
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const res = await aiApi.tripPlan({
        source: form.source,
        destination: form.destination,
        vehicleModel: form.vehicleModel || 'sedan',
        routeType: form.routeType,
        traffic: form.traffic,
        avg_speed_kmph: Number(form.avgSpeed),
        max_speed_kmph: Number(form.maxSpeed),
        durationDays: Number(form.durationDays),
        transportMode: form.transportMode,
      });
      setPlan(res.data);

      // Fetch attractions
      setAttractionsLoading(true);
      try {
        const atRes = await aiApi.attractions(form.destination);
        setAttractions(atRes.data?.attractions || []);
      } catch { }
      setAttractionsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = () => {
    if (!plan) return;
    addTrip({
      source: form.source,
      destination: form.destination,
      packageId: form.packageId,
      packageName: packages.find((p) => p.id === form.packageId)?.name || '',
      organizerName: user?.username,
      plan,
      status: 'planned',
    });
    Alert.alert('Saved!', 'Route saved to your trips.');
  };

  // Build OSM map URL for WebView
  const mapUrl = plan
    ? `https://www.openstreetmap.org/directions?engine=osrm_car&route=${encodeURIComponent(form.source + ';' + form.destination)}`
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Form */}
        <View style={styles.formCard}>
          <AppTextInput
            label="From (Source)"
            value={form.source}
            onChangeText={set('source')}
            placeholder="e.g. Chennai"
            autoCapitalize="words"
          />
          <AppTextInput
            label="To (Destination)"
            value={form.destination}
            onChangeText={set('destination')}
            placeholder="e.g. Goa"
            autoCapitalize="words"
          />
          <AppTextInput
            label="Vehicle Model"
            value={form.vehicleModel}
            onChangeText={set('vehicleModel')}
            placeholder="e.g. Toyota Innova"
            autoCapitalize="words"
          />
          <AppTextInput
            label="Duration (Days)"
            value={form.durationDays}
            onChangeText={set('durationDays')}
            keyboardType="numeric"
          />

          {/* Transport mode */}
          <Text style={styles.pickerLabel}>Transport Mode</Text>
          <View style={styles.modeRow}>
            {TRANSPORT_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.modeBtn, form.transportMode === m.value && styles.modeBtnActive]}
                onPress={() => set('transportMode')(m.value)}
              >
                <Ionicons
                  name={m.icon}
                  size={18}
                  color={form.transportMode === m.value ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[styles.modeText, form.transportMode === m.value && styles.modeTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Route type */}
          <Text style={styles.pickerLabel}>Route Type</Text>
          <View style={styles.chipRow}>
            {ROUTE_TYPES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, form.routeType === r && styles.chipActive]}
                onPress={() => set('routeType')(r)}
              >
                <Text style={[styles.chipTxt, form.routeType === r && styles.chipTxtActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Traffic */}
          <Text style={styles.pickerLabel}>Traffic</Text>
          <View style={styles.chipRow}>
            {TRAFFIC_LEVELS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, form.traffic === t && styles.chipActive]}
                onPress={() => set('traffic')(t)}
              >
                <Text style={[styles.chipTxt, form.traffic === t && styles.chipTxtActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton
            title={loading ? 'Planning…' : '🗺️ Plan Route'}
            onPress={handlePlan}
            loading={loading}
            style={styles.planBtn}
          />
        </View>

        {error ? <ErrorMessage message={error} onRetry={handlePlan} style={styles.errorMsg} /> : null}

        {/* Plan result */}
        {plan && (
          <View style={styles.resultSection}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <StatBadge icon="📍" label="Distance" value={`${plan.distance} km`} />
              <StatBadge icon="⏱" label="Duration" value={plan.duration} />
              <StatBadge icon="⛽" label="Fuel Cost" value={`₹${plan.estimatedFuelCost}`} />
              <StatBadge icon="🛣️" label="Toll" value={`₹${plan.estimatedTollCost}`} />
            </View>

            {/* Eco tip */}
            {plan.ecoTip && (
              <Card style={styles.ecoCard}>
                <Text style={styles.ecoTitle}>🌱 Eco Tip</Text>
                <Text style={styles.ecoText}>{plan.ecoTip}</Text>
              </Card>
            )}

            {/* Route description */}
            {plan.suggestedRoute && (
              <Card>
                <Text style={styles.routeTitle}>Suggested Route</Text>
                <Text style={styles.routeText}>{plan.suggestedRoute}</Text>
              </Card>
            )}

            {/* Map button */}
            <TouchableOpacity style={styles.mapBtn} onPress={() => setShowMap(true)}>
              <Ionicons name="map" size={18} color={COLORS.white} />
              <Text style={styles.mapBtnText}>View on Map</Text>
            </TouchableOpacity>

            {/* Itinerary */}
            {plan.itinerary?.length > 0 && (
              <>
                <SectionHeader title="Day-wise Itinerary" />
                {plan.itinerary.map((item, i) => (
                  <Card key={i} style={styles.itineraryCard}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayText}>Day {item.day}</Text>
                    </View>
                    <Text style={styles.itActivity}>{item.time} — {item.activity}</Text>
                    {item.notes && <Text style={styles.itNotes}>{item.notes}</Text>}
                  </Card>
                ))}
              </>
            )}

            {/* Attractions */}
            {attractionsLoading && <LoadingSpinner message="Finding attractions…" />}
            {attractions.length > 0 && (
              <>
                <SectionHeader title="✨ Attractions" />
                {attractions.map((att, i) => (
                  <Card key={i}>
                    <View style={styles.attRow}>
                      <Text style={styles.attName}>{att.name}</Text>
                      {att.mustVisit && (
                        <View style={styles.mustVisit}>
                          <Text style={styles.mustVisitText}>Must Visit</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.attType}>{att.type}</Text>
                    <Text style={styles.attDesc}>{att.description}</Text>
                    <Text style={styles.attRating}>⭐ {att.rating}/5</Text>
                  </Card>
                ))}
              </>
            )}

            {/* Save route */}
            <PrimaryButton
              title="💾 Save to Trips"
              onPress={handleSaveRoute}
              style={styles.saveBtn}
              color={COLORS.success}
            />
          </View>
        )}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={showMap} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>{form.source} → {form.destination}</Text>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StatBadge({ icon, label, value }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  formCard: {
    margin: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pickerLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '700', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  modeRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  modeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md,
    gap: 3, borderWidth: 1, borderColor: COLORS.border,
  },
  modeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '600' },
  modeTextActive: { color: COLORS.white },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt: { fontSize: FONTS.xs, color: COLORS.textSecondary, fontWeight: '600' },
  chipTxtActive: { color: COLORS.white },
  planBtn: { marginTop: SPACING.md },
  errorMsg: { margin: SPACING.base },
  resultSection: { padding: SPACING.base },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  statBadge: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONTS.xs, color: COLORS.textMuted },
  ecoCard: { backgroundColor: '#052e16', borderWidth: 1, borderColor: COLORS.success },
  ecoTitle: { color: COLORS.success, fontWeight: '700', marginBottom: 4 },
  ecoText: { color: '#86efac', fontSize: FONTS.sm },
  routeTitle: { color: COLORS.textPrimary, fontWeight: '700', marginBottom: 6 },
  routeText: { color: COLORS.textSecondary, fontSize: FONTS.sm, lineHeight: 20 },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md, padding: SPACING.md, marginVertical: SPACING.md,
  },
  mapBtnText: { color: COLORS.white, fontWeight: '700' },
  itineraryCard: { marginBottom: SPACING.sm },
  dayBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  dayText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '800' },
  itActivity: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm },
  itNotes: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 4 },
  attRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  attName: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  mustVisit: { backgroundColor: '#fff7ed', paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: RADIUS.sm },
  mustVisitText: { color: COLORS.warning, fontSize: 10, fontWeight: '700' },
  attType: { color: COLORS.textMuted, fontSize: FONTS.xs, marginBottom: 4 },
  attDesc: { color: COLORS.textSecondary, fontSize: FONTS.xs, lineHeight: 18 },
  attRating: { color: COLORS.warning, fontSize: FONTS.xs, marginTop: 4, fontWeight: '600' },
  saveBtn: { marginTop: SPACING.md },
  mapHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  mapTitle: { color: COLORS.textPrimary, fontWeight: '700', flex: 1 },
});
