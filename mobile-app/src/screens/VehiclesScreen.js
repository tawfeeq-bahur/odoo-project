import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vehicleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  StatusBadge,
  SectionHeader,
  PrimaryButton,
  OutlineButton,
} from '../components/UIComponents';
import { generateId } from '../utils/helpers';

const FUEL_COLORS = (v) => {
  if (v >= 60) return COLORS.success;
  if (v >= 30) return COLORS.warning;
  return COLORS.danger;
};

export default function VehiclesScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  // Add form
  const [form, setForm] = useState({ regNumber: '', model: '', type: 'Bus', fuelLevel: '80', status: 'active' });
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await vehicleApi.getAll();
      setVehicles(res.data?.vehicles || res.data || []);
    } catch (err) {
      setError('Failed to load vehicles. Showing demo data.');
      setVehicles(DEMO_VEHICLES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchVehicles(true); }, []);

  const filtered = vehicles.filter((v) =>
    [v.regNumber, v.model, v.type].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.regNumber.trim() || !form.model.trim()) {
      Alert.alert('Required', 'Enter registration number and model.');
      return;
    }
    setSaving(true);
    try {
      await vehicleApi.create(form);
      await fetchVehicles(true);
      setAddVisible(false);
      setForm({ regNumber: '', model: '', type: 'Bus', fuelLevel: '80', status: 'active' });
    } catch {
      // optimistic
      setVehicles((prev) => [...prev, { ...form, id: generateId(), fuelLevel: parseInt(form.fuelLevel) || 80 }]);
      setAddVisible(false);
      setForm({ regNumber: '', model: '', type: 'Bus', fuelLevel: '80', status: 'active' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Vehicle', 'Remove this vehicle from the fleet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { await vehicleApi.delete(id); } catch { /* optimistic */ }
          setVehicles((prev) => prev.filter((v) => v.id !== id));
        },
      },
    ]);
  };

  const renderVehicle = ({ item }) => {
    const fuel = item.fuelLevel ?? 80;
    const fuelClr = FUEL_COLORS(fuel);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })} activeOpacity={0.8}>
        <Card style={styles.vehicleCard}>
          <View style={styles.cardTop}>
            <View style={styles.vehicleIcon}>
              <Ionicons name="bus-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.vehicleName}>{item.regNumber || item.registration_number}</Text>
              <Text style={styles.vehicleModel}>{item.model} • {item.type}</Text>
            </View>
            <StatusBadge status={item.status || 'active'} />
            {isAdmin && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
          {/* Fuel bar */}
          <Text style={[styles.fuelLabel, { color: fuelClr }]}>Fuel: {fuel}%</Text>
          <View style={styles.fuelBarBg}>
            <View style={[styles.fuelBarFill, { width: `${fuel}%`, backgroundColor: fuelClr }]} />
          </View>
          {item.assignedTo && (
            <Text style={styles.assignedTo}>
              <Ionicons name="person-outline" size={12} color={COLORS.textMuted} /> {item.assignedTo}
            </Text>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) return <LoadingSpinner message="Loading vehicles..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search vehicles..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Ionicons name="add" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {error ? <ErrorMessage message={error} style={{ margin: SPACING.base, marginBottom: 0 }} /> : null}

      <FlatList
        data={filtered}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={<EmptyState icon="bus-outline" title="No vehicles found" subtitle="Add a vehicle to get started" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Vehicle Modal */}
      <Modal visible={addVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vehicle</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {['regNumber', 'model', 'type'].map((field) => (
              <View key={field} style={{ marginBottom: SPACING.sm }}>
                <Text style={styles.fieldLabel}>{field === 'regNumber' ? 'Reg. Number' : field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                <TextInput
                  style={styles.input}
                  value={form[field]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [field]: v }))}
                  placeholder={`Enter ${field}`}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}
            <View style={styles.modalActions}>
              <OutlineButton title="Cancel" onPress={() => setAddVisible(false)} style={{ flex: 1 }} />
              <PrimaryButton title="Add" onPress={handleAdd} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DEMO_VEHICLES = [
  { id: '1', regNumber: 'TN01AB1234', model: 'Ashok Leyland 12M', type: 'Bus', fuelLevel: 75, status: 'active', assignedTo: 'Ravi Kumar' },
  { id: '2', regNumber: 'TN02CD5678', model: 'TATA Starbus', type: 'Mini Bus', fuelLevel: 45, status: 'maintenance', assignedTo: null },
  { id: '3', regNumber: 'TN03EF9012', model: 'Force Traveller', type: 'Van', fuelLevel: 20, status: 'active', assignedTo: 'Priya Nair' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', padding: SPACING.base, gap: SPACING.sm, alignItems: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, height: 40,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sm },
  addBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  vehicleCard: { marginBottom: SPACING.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  vehicleIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center',
  },
  vehicleName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  vehicleModel: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  deleteBtn: { padding: SPACING.xs },
  fuelLabel: { fontSize: FONTS.xs, fontWeight: '600', marginBottom: 4 },
  fuelBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginBottom: SPACING.xs },
  fuelBarFill: { height: 6, borderRadius: 3 },
  assignedTo: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'], padding: SPACING.lg, paddingBottom: SPACING['2xl'],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.lg },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.base,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
