import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { odometerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  StatusBadge,
  PrimaryButton,
  OutlineButton,
} from '../components/UIComponents';
import { formatDate } from '../utils/helpers';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function OdometerScreen() {
  const { isAdmin } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [photoModal, setPhotoModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReadings = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await odometerApi.getAll();
      setReadings(res.data?.readings || res.data || []);
    } catch {
      setError('Could not load readings. Showing demo data.');
      setReadings(DEMO_READINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReadings(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchReadings(true); }, []);

  const filtered = readings.filter((r) => {
    const matchSearch = [r.employeeName, r.vehicleReg, r.readingKm?.toString()].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = async (action) => {
    if (!approveModal) return;
    setProcessing(true);
    try {
      await odometerApi.updateStatus(approveModal.id, action, adminNotes);
      setReadings((prev) =>
        prev.map((r) => r.id === approveModal.id ? { ...r, status: action, adminNotes } : r)
      );
    } catch {
      setReadings((prev) =>
        prev.map((r) => r.id === approveModal.id ? { ...r, status: action } : r)
      );
    } finally {
      setProcessing(false);
      setApproveModal(null);
      setAdminNotes('');
    }
  };

  const renderReading = ({ item }) => (
    <Card style={styles.readingCard}>
      <View style={styles.readingTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vehicleReg}>{item.vehicleReg || item.vehicle_reg || 'Unknown'}</Text>
          <Text style={styles.employeeName}>{item.employeeName || item.employee_name}</Text>
        </View>
        <StatusBadge status={item.status || 'pending'} />
      </View>

      <View style={styles.readingMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="speedometer-outline" size={14} color={COLORS.primary} />
          <Text style={styles.readingKm}>{item.readingKm?.toLocaleString() || '—'} km</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{formatDate(item.submittedAt || item.date)}</Text>
        </View>
      </View>

      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

      <View style={styles.readingActions}>
        {item.imageUrl && (
          <TouchableOpacity style={styles.photoBtn} onPress={() => setPhotoModal(item.imageUrl)}>
            <Ionicons name="image-outline" size={14} color={COLORS.primary} />
            <Text style={styles.photoBtnText}>View Photo</Text>
          </TouchableOpacity>
        )}
        {isAdmin && item.status === 'pending' && (
          <TouchableOpacity style={styles.reviewBtn} onPress={() => setApproveModal(item)}>
            <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.warning} />
            <Text style={styles.reviewBtnText}>Review</Text>
          </TouchableOpacity>
        )}
        {item.adminNotes && (
          <Text style={styles.adminNote}>Admin: {item.adminNotes}</Text>
        )}
      </View>
    </Card>
  );

  if (loading && !refreshing) return <LoadingSpinner message="Loading odometer readings..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Search */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search readings..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <ErrorMessage message={error} style={{ marginHorizontal: SPACING.base, marginBottom: 0 }} /> : null}

      <FlatList
        data={filtered}
        renderItem={renderReading}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={<EmptyState icon="speedometer-outline" title="No readings found" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Photo Modal */}
      <Modal visible={!!photoModal} animationType="fade" transparent>
        <View style={styles.photoOverlay}>
          <TouchableOpacity style={styles.photoClose} onPress={() => setPhotoModal(null)}>
            <Ionicons name="close-circle" size={32} color={COLORS.white} />
          </TouchableOpacity>
          {photoModal && <Image source={{ uri: photoModal }} style={styles.photoFull} resizeMode="contain" />}
        </View>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal visible={!!approveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Reading</Text>
              <TouchableOpacity onPress={() => setApproveModal(null)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            {approveModal && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>Vehicle: {approveModal.vehicleReg}</Text>
                <Text style={styles.modalInfoText}>Reading: {approveModal.readingKm?.toLocaleString()} km</Text>
                <Text style={styles.modalInfoText}>Submitted by: {approveModal.employeeName}</Text>
              </View>
            )}
            <Text style={styles.fieldLabel}>Admin Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={adminNotes}
              onChangeText={setAdminNotes}
              multiline
              placeholder="Add any notes here..."
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.modalActions}>
              <OutlineButton
                title="❌ Reject"
                onPress={() => handleAction('rejected')}
                loading={processing}
                style={[styles.actionBtn, { borderColor: COLORS.danger }]}
                textStyle={{ color: COLORS.danger }}
              />
              <PrimaryButton
                title="✅ Approve"
                onPress={() => handleAction('approved')}
                loading={processing}
                style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DEMO_READINGS = [
  { id: '1', vehicleReg: 'TN01AB1234', employeeName: 'Ravi Kumar', readingKm: 45230, status: 'pending', submittedAt: new Date().toISOString(), notes: 'End of day reading' },
  { id: '2', vehicleReg: 'TN03EF9012', employeeName: 'Priya Nair', readingKm: 12800, status: 'approved', submittedAt: new Date(Date.now() - 86400000).toISOString(), adminNotes: 'Verified' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: { padding: SPACING.base, paddingBottom: SPACING.xs },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, height: 40,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sm },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.xs, marginBottom: SPACING.xs },
  filterChip: {
    flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
    alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  readingCard: { marginBottom: SPACING.sm },
  readingTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  vehicleReg: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base },
  employeeName: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  readingMeta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readingKm: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.base },
  metaText: { color: COLORS.textMuted, fontSize: FONTS.xs },
  notes: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontStyle: 'italic', marginBottom: SPACING.xs },
  readingActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryDim, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  photoBtnText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '700' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.warningDim, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  reviewBtnText: { color: COLORS.warning, fontSize: FONTS.xs, fontWeight: '700' },
  adminNote: { color: COLORS.textMuted, fontSize: FONTS.xs, fontStyle: 'italic' },
  photoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  photoClose: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  photoFull: { width: '90%', height: '80%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'], padding: SPACING.lg, paddingBottom: SPACING['2xl'],
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.lg },
  modalInfo: { backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md, gap: 4 },
  modalInfoText: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, padding: SPACING.sm,
    color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.base,
    marginBottom: SPACING.md,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1 },
});
