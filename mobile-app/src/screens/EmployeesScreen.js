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
import { employeeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  SectionHeader,
  PrimaryButton,
  OutlineButton,
} from '../components/UIComponents';
import { getInitials, generateId } from '../utils/helpers';

export default function EmployeesScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Driver' });
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data?.employees || res.data || []);
    } catch {
      setError('Could not load employees. Showing demo data.');
      setEmployees(DEMO_EMPLOYEES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchEmployees(true); }, []);

  const filtered = employees.filter((e) =>
    [e.name, e.email, e.role, e.phone].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert('Required', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await employeeApi.create(form);
      await fetchEmployees(true);
      setAddVisible(false);
      setForm({ name: '', email: '', phone: '', role: 'Driver' });
    } catch {
      setEmployees((prev) => [...prev, { ...form, id: generateId() }]);
      setAddVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const ROLES = ['Driver', 'Guide', 'Coordinator', 'Admin', 'Support'];

  const renderEmployee = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EmployeeDetail', { employee: item })}
      activeOpacity={0.8}
    >
      <Card style={styles.empCard}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.empName}>{item.name}</Text>
            <Text style={styles.empEmail}>{item.email}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role || 'Driver'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
        {item.phone && (
          <Text style={styles.phone}>
            <Ionicons name="call-outline" size={12} color={COLORS.textMuted} /> {item.phone}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) return <LoadingSpinner message="Loading employees..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search employees..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Ionicons name="add" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {error ? <ErrorMessage message={error} style={{ marginHorizontal: SPACING.base, marginBottom: 0 }} /> : null}

      <Text style={styles.count}>{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No employees found" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Employee Modal */}
      <Modal visible={addVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Employee</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {[
              { key: 'name', label: 'Full Name', placeholder: 'Enter full name' },
              { key: 'email', label: 'Email', placeholder: 'email@example.com', type: 'email-address' },
              { key: 'phone', label: 'Phone', placeholder: '+91 9876543210', type: 'phone-pad' },
            ].map((field) => (
              <View key={field.key} style={{ marginBottom: SPACING.sm }}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[field.key]}
                  onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={field.type || 'default'}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                />
              </View>
            ))}

            {/* Role Selector */}
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, form.role === r && styles.roleChipActive]}
                  onPress={() => setForm((p) => ({ ...p, role: r }))}
                >
                  <Text style={[styles.roleChipText, form.role === r && { color: COLORS.white }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

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

const DEMO_EMPLOYEES = [
  { id: '1', name: 'Arun Kumar', email: 'arun@tourjet.in', phone: '9876543210', role: 'Admin' },
  { id: '2', name: 'Priya Nair', email: 'priya@tourjet.in', phone: '9123456789', role: 'Guide' },
  { id: '3', name: 'Ravi Shankar', email: 'ravi@tourjet.in', phone: '9988776655', role: 'Driver' },
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
  count: { color: COLORS.textMuted, fontSize: FONTS.xs, paddingHorizontal: SPACING.base, marginBottom: SPACING.xs },
  empCard: { marginBottom: SPACING.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sm },
  empName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  empEmail: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  roleBadge: {
    backgroundColor: COLORS.primaryDim, paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderRadius: RADIUS.full,
  },
  roleText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '700' },
  phone: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: SPACING.xs },
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
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  roleChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
