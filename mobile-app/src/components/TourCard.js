import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import { StatusBadge } from './UIComponents';
import { formatDate, formatCurrency, daysRemaining } from '../utils/helpers';

export default function TourCard({ pkg, onPress, onEdit, onDelete, showActions = false }) {
  const days = daysRemaining(pkg.endDate);
  const typeEmoji = { friends: '👥', family: '👨‍👩‍👧', school: '🎒' }[pkg.tripType] || '✈️';

  return (
    <TouchableOpacity
      style={[styles.card, SHADOW.sm]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{typeEmoji}</Text>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>{pkg.name}</Text>
            <Text style={styles.destination} numberOfLines={1}>
              📍 {pkg.destination}
            </Text>
          </View>
        </View>
        <StatusBadge status={pkg.status} />
      </View>

      {/* Info row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.infoText}>
            {formatDate(pkg.startDate, 'MMM dd')} – {formatDate(pkg.endDate, 'MMM dd, yyyy')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.infoText}>
            {(pkg.members?.length || 0) + 1}/{pkg.maxMembers || '∞'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.infoText}>{formatCurrency(pkg.pricePerPerson)}/pax</Text>
        </View>
      </View>

      {/* Footer row */}
      <View style={styles.footer}>
        <Text style={styles.duration}>⏱ {pkg.durationDays}d</Text>
        {days != null && days >= 0 && (
          <Text style={styles.countdown}>
            🗓 {days === 0 ? 'Today!' : `${days}d left`}
          </Text>
        )}
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                <Ionicons name="pencil" size={15} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
                <Ionicons name="trash" size={15} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SPACING.sm },
  emoji: { fontSize: 22, marginRight: SPACING.sm },
  titleBlock: { flex: 1 },
  name: { fontSize: FONTS.base, fontWeight: '700', color: COLORS.textPrimary },
  destination: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  infoText: { fontSize: FONTS.xs, color: COLORS.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  duration: { fontSize: FONTS.xs, color: COLORS.textMuted },
  countdown: { fontSize: FONTS.xs, color: COLORS.warning, fontWeight: '600' },
  actions: { flexDirection: 'row', marginLeft: 'auto', gap: SPACING.xs },
  actionBtn: {
    padding: SPACING.xs,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.sm,
  },
  deleteBtn: { backgroundColor: COLORS.dangerBg },
});
