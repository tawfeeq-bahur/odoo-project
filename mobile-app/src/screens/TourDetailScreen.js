import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import {
  StatusBadge,
  Card,
  SectionHeader,
  PrimaryButton,
  EmptyState,
  Divider,
} from '../components/UIComponents';
import ExpenseCard from '../components/ExpenseCard';
import { formatDate, formatCurrency, daysRemaining } from '../utils/helpers';

export default function TourDetailScreen({ route, navigation }) {
  const { tourId } = route.params || {};
  const { packages, expenses } = useAppState();
  const { user } = useAuth();

  const tour = packages.find((p) => p.id === tourId);

  if (!tour) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Tour not found</Text>
      </View>
    );
  }

  const isOrganizer = tour.organizerName === user?.username;
  const tourExpenses = expenses.filter((e) => e.tourId === tourId);
  const approvedTotal = tourExpenses
    .filter((e) => e.status === 'approved')
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const days = daysRemaining(tour.endDate);
  const allMembers = [tour.organizerName, ...(tour.members || [])];

  const handleShare = async () => {
    await Share.share({
      message: `Join my tour "${tour.name}" to ${tour.destination}!\nInvite Code: ${tour.inviteCode}\nDates: ${formatDate(tour.startDate)} – ${formatDate(tour.endDate)}`,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>
              {{ friends: '👥', family: '👨‍👩‍👧', school: '🎒' }[tour.tripType] || '✈️'}
            </Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{tour.name}</Text>
            <Text style={styles.heroDestination}>📍 {tour.destination}</Text>
            <View style={styles.heroRow}>
              <StatusBadge status={tour.status} />
              {days != null && days >= 0 && (
                <Text style={styles.countdown}>
                  ⏳ {days === 0 ? 'Today!' : `${days} days left`}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick stats */}
          <View style={styles.statsGrid}>
            <InfoItem icon="calendar" label="Start" value={formatDate(tour.startDate)} />
            <InfoItem icon="calendar" label="End" value={formatDate(tour.endDate)} />
            <InfoItem icon="time" label="Duration" value={`${tour.durationDays} days`} />
            <InfoItem icon="cash" label="Price/pax" value={formatCurrency(tour.pricePerPerson)} />
            <InfoItem icon="people" label="Members" value={`${allMembers.length}/${tour.maxMembers}`} />
            <InfoItem icon="wallet" label="Approved Spend" value={formatCurrency(approvedTotal)} />
          </View>

          <Divider />

          {/* Invite code */}
          {isOrganizer && (
            <Card style={styles.inviteCard}>
              <View style={styles.inviteRow}>
                <View>
                  <Text style={styles.inviteLabel}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{tour.inviteCode}</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Ionicons name="share-social" size={20} color={COLORS.primary} />
                  <Text style={styles.shareTxt}>Share</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Members */}
          <SectionHeader title="Members" action={isOrganizer ? () => navigation.navigate('Members') : undefined} actionLabel="Manage" />
          <Card>
            {allMembers.map((m, i) => (
              <View key={i} style={[styles.memberRow, i < allMembers.length - 1 && styles.memberBorder]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{m}</Text>
                {i === 0 && (
                  <View style={styles.organizerBadge}>
                    <Text style={styles.organizerText}>Organizer</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* Drive link */}
          {tour.driveLink && (
            <>
              <SectionHeader title="📸 Photo Album" />
              <Card>
                <TouchableOpacity onPress={() => Linking.openURL(tour.driveLink)}>
                  <Text style={styles.driveLink}>Open Google Drive Album →</Text>
                </TouchableOpacity>
              </Card>
            </>
          )}

          {/* Expenses */}
          <SectionHeader title="Expenses" />
          {tourExpenses.length === 0 ? (
            <EmptyState icon="💸" title="No expenses yet" />
          ) : (
            tourExpenses.map((exp) => <ExpenseCard key={exp.id} expense={exp} />)
          )}

          {/* Actions */}
          {isOrganizer && (
            <View style={styles.actions}>
              <PrimaryButton
                title="Manage Members"
                onPress={() => navigation.navigate('Members')}
              />
            </View>
          )}

          <View style={{ height: SPACING['2xl'] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={`${icon}-outline`} size={14} color={COLORS.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: COLORS.textSecondary },
  hero: {
    flexDirection: 'row',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    alignItems: 'flex-start',
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroIcon: {
    width: 56, height: 56, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 26 },
  heroInfo: { flex: 1 },
  heroName: { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.textPrimary },
  heroDestination: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginTop: 2, marginBottom: SPACING.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  countdown: { fontSize: FONTS.xs, color: COLORS.warning, fontWeight: '600' },
  content: { padding: SPACING.base },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoItem: {
    width: '33.33%', padding: SPACING.md,
    alignItems: 'center', borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  infoLabel: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 4 },
  infoValue: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2, textAlign: 'center' },
  inviteCard: { marginBottom: SPACING.sm },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inviteLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs },
  inviteCode: { fontSize: FONTS['2xl'], fontWeight: '900', color: COLORS.primary, letterSpacing: 4 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.sm },
  shareTxt: { color: COLORS.primary, fontWeight: '600', fontSize: FONTS.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontWeight: '700' },
  memberName: { flex: 1, color: COLORS.textPrimary, fontWeight: '600' },
  organizerBadge: { backgroundColor: COLORS.primaryBg, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  organizerText: { color: COLORS.primary, fontSize: FONTS.xs, fontWeight: '700' },
  driveLink: { color: COLORS.primary, fontWeight: '600' },
  actions: { gap: SPACING.sm, marginTop: SPACING.md },
});
