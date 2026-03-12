import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import {
  Card,
  EmptyState,
  StatusBadge,
  SectionHeader,
  PrimaryButton,
  OutlineButton,
} from '../components/UIComponents';
import { formatDate, daysRemaining } from '../utils/helpers';

const STATUS_TAB = ['all', 'ongoing', 'planned', 'completed'];

export default function TripsScreen({ navigation }) {
  const { trips, updateTripStatus } = useAppState();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const filtered = activeTab === 'all'
    ? trips
    : trips.filter((t) => t.status === activeTab);

  const openDetail = (trip) => {
    setSelectedTrip(trip);
    setDetailVisible(true);
  };

  const handleStatusChange = (tripId, newStatus) => {
    Alert.alert('Update Trip', `Mark this trip as "${newStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          updateTripStatus(tripId, newStatus);
          setDetailVisible(false);
        },
      },
    ]);
  };

  const statusColor = {
    ongoing: COLORS.success,
    planned: COLORS.warning,
    completed: COLORS.textMuted,
  };

  const renderTrip = ({ item }) => (
    <TouchableOpacity onPress={() => openDetail(item)} activeOpacity={0.8}>
      <Card style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripSub}>{item.destination}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{item.memberCount || 0} members</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>₹{(item.totalExpenses || 0).toLocaleString()}</Text>
          </View>
        </View>
        {item.status === 'planned' && (
          <Text style={styles.countdown}>
            {daysRemaining(item.startDate)} days away
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {STATUS_TAB.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING['3xl'] }}
        ListEmptyComponent={<EmptyState icon="map-outline" title="No trips found" subtitle="Start a new trip from the Home screen" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Trip Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedTrip && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedTrip.name}</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Destination</Text>
                    <Text style={styles.detailVal}>{selectedTrip.destination}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <StatusBadge status={selectedTrip.status} />
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start Date</Text>
                    <Text style={styles.detailVal}>{formatDate(selectedTrip.startDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Members</Text>
                    <Text style={styles.detailVal}>{selectedTrip.memberCount || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Expenses</Text>
                    <Text style={[styles.detailVal, { color: COLORS.warning }]}>
                      ₹{(selectedTrip.totalExpenses || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  {selectedTrip.status === 'planned' && (
                    <PrimaryButton
                      title="🚀 Start Trip"
                      onPress={() => handleStatusChange(selectedTrip.id, 'ongoing')}
                      style={{ marginBottom: SPACING.sm }}
                    />
                  )}
                  {selectedTrip.status === 'ongoing' && (
                    <>
                      <PrimaryButton
                        title="📷 Log Expense"
                        onPress={() => { setDetailVisible(false); navigation.navigate('Scanner'); }}
                        style={{ marginBottom: SPACING.sm }}
                      />
                      <OutlineButton
                        title="✅ End Trip"
                        onPress={() => handleStatusChange(selectedTrip.id, 'completed')}
                        style={{ marginBottom: SPACING.sm }}
                      />
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm, gap: SPACING.xs,
  },
  tab: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    alignItems: 'center', backgroundColor: COLORS.surface,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  tripCard: { marginBottom: SPACING.sm },
  tripRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  tripName: { color: COLORS.textPrimary, fontWeight: '700', fontSize: FONTS.base, marginBottom: 2 },
  tripSub: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  tripMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: FONTS.xs },
  countdown: { color: COLORS.warning, fontSize: FONTS.xs, marginTop: SPACING.xs, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'], padding: SPACING.lg, paddingBottom: SPACING['2xl'],
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: FONTS.lg },
  modalBody: { gap: SPACING.sm, marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: COLORS.textSecondary, fontSize: FONTS.sm },
  detailVal: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm },
  modalActions: {},
});
