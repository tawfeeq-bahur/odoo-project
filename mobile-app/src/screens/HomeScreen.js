import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import TourCard from '../components/TourCard';
import ExpenseCard from '../components/ExpenseCard';
import {
  StatCard,
  SectionHeader,
  PrimaryButton,
  EmptyState,
  LoadingSpinner,
  Card,
  Divider,
} from '../components/UIComponents';
import AppTextInput from '../components/AppTextInput';
import { formatCurrency, generateInviteCode, generateId } from '../utils/helpers';
import { TOUR_STATUSES } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const { packages, expenses, addPackage, deletePackage } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Derived stats
  const myPackages = packages.filter(
    (p) => p.organizerName === user?.username
  );
  const joinedTours = packages.filter(
    (p) =>
      p.organizerName !== user?.username &&
      p.members?.includes(user?.username)
  );
  const totalExpenses = expenses
    .filter((e) => e.status === 'approved')
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  // Filtered packages
  const filtered = packages.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (pkg) => {
    if (pkg.organizerName !== user?.username) return;
    Alert.alert(
      'Delete Tour',
      `Delete "${pkg.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePackage(pkg.id) },
      ]
    );
  };

  const renderTourItem = ({ item }) => (
    <TourCard
      pkg={item}
      onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
      onEdit={item.organizerName === user?.username ? () => {} : undefined}
      onDelete={item.organizerName === user?.username ? () => handleDelete(item) : undefined}
      showActions={item.organizerName === user?.username}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.firstName || user?.username} 👋
            </Text>
            <Text style={styles.subtitle}>Manage your tours & trips</Text>
          </View>
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'SOS' })}
          >
            <Ionicons name="warning" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Organized" value={myPackages.length} icon="📦" color={COLORS.primary} />
          <StatCard label="Joined" value={joinedTours.length} icon="✈️" color={COLORS.accent} />
          <StatCard label="Approved Spend" value={`₹${(totalExpenses / 1000).toFixed(1)}k`} icon="💰" color={COLORS.success} />
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.qaBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle" size={22} color={COLORS.primary} />
            <Text style={styles.qaText}>New Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => navigation.navigate('JoinTour')}>
            <Ionicons name="link" size={22} color={COLORS.accent} />
            <Text style={styles.qaText}>Join Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => navigation.navigate('Reports')}>
            <Ionicons name="bar-chart" size={22} color={COLORS.success} />
            <Text style={styles.qaText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaBtn} onPress={() => navigation.navigate('ExploreTab', { screen: 'AIDemo' })}>
            <Ionicons name="sparkles" size={22} color={COLORS.warning} />
            <Text style={styles.qaText}>AI Demo</Text>
          </TouchableOpacity>
        </View>

        <Divider />

        {/* Tours section */}
        <SectionHeader
          title="All Tours"
          action={() => navigation.navigate('Members')}
          actionLabel="Members"
        />

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tours or destinations…"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', ...TOUR_STATUSES].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={[styles.filterText, filterStatus === s && styles.filterTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tour list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No tours found"
            subtitle="Create your first tour or join one with an invite code"
            action={() => setShowAddModal(true)}
            actionLabel="Organize a Tour"
          />
        ) : (
          filtered.map((item) => (
            <TourCard
              key={item.id}
              pkg={item}
              onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
              showActions={item.organizerName === user?.username}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}

        {/* Recent expenses */}
        <SectionHeader title="Recent Expenses" style={styles.sectionGap} />
        {expenses.slice(0, 5).map((exp) => (
          <ExpenseCard key={exp.id} expense={exp} />
        ))}

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>

      {/* Add Package Modal */}
      <AddPackageModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => {
          addPackage({ ...data, organizerName: user?.username });
          setShowAddModal(false);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Add Package Modal ────────────────────────────────────────────────────────
function AddPackageModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', destination: '', status: 'planning',
    pricePerPerson: '', durationDays: '', tripType: 'friends',
    maxMembers: '10', maxBudget: '',
    startDate: '', endDate: '',
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.destination.trim()) {
      Alert.alert('Required', 'Name and destination are required.');
      return;
    }
    onSave({
      ...form,
      pricePerPerson: Number(form.pricePerPerson) || 0,
      durationDays: Number(form.durationDays) || 1,
      maxMembers: Number(form.maxMembers) || 10,
      maxBudget: Number(form.maxBudget) || 0,
    });
    setForm({ name: '', destination: '', status: 'planning', pricePerPerson: '', durationDays: '', tripType: 'friends', maxMembers: '10', maxBudget: '', startDate: '', endDate: '' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Organize a Tour</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <AppTextInput label="Tour Name *" value={form.name} onChangeText={set('name')} placeholder="e.g. Goa Summer Trip" autoCapitalize="words" />
          <AppTextInput label="Destination *" value={form.destination} onChangeText={set('destination')} placeholder="e.g. Goa, India" autoCapitalize="words" />
          <AppTextInput label="Start Date" value={form.startDate} onChangeText={set('startDate')} placeholder="YYYY-MM-DD" />
          <AppTextInput label="End Date" value={form.endDate} onChangeText={set('endDate')} placeholder="YYYY-MM-DD" />
          <AppTextInput label="Price Per Person (₹)" value={form.pricePerPerson} onChangeText={set('pricePerPerson')} placeholder="0" keyboardType="numeric" />
          <AppTextInput label="Duration (Days)" value={form.durationDays} onChangeText={set('durationDays')} placeholder="5" keyboardType="numeric" />
          <AppTextInput label="Max Members" value={form.maxMembers} onChangeText={set('maxMembers')} placeholder="10" keyboardType="numeric" />
          <AppTextInput label="Max Budget (₹)" value={form.maxBudget} onChangeText={set('maxBudget')} placeholder="50000" keyboardType="numeric" />
          <PrimaryButton title="Create Tour" onPress={handleSave} style={{ marginTop: SPACING.md }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, paddingHorizontal: SPACING.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: SPACING.base, marginBottom: SPACING.base },
  greeting: { fontSize: FONTS['2xl'], fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 2 },
  sosBtn: { padding: SPACING.sm, backgroundColor: COLORS.dangerBg, borderRadius: RADIUS.md },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  quickActions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  qaBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  qaText: { fontSize: FONTS.xs, color: COLORS.textSecondary, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, paddingVertical: SPACING.md, color: COLORS.textPrimary, fontSize: FONTS.sm },
  filterScroll: { marginBottom: SPACING.md },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.xs,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  sectionGap: { marginTop: SPACING.md },
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.textPrimary },
  modalScroll: { padding: SPACING.xl },
});
