import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';
import { StatusBadge } from './UIComponents';
import { formatDate, formatCurrency } from '../utils/helpers';

const TYPE_ICON = {
  Travel: 'airplane',
  Food: 'restaurant',
  Hotel: 'bed',
  Tickets: 'ticket',
  Misc: 'receipt',
};

const TYPE_COLOR = {
  Travel: COLORS.primary,
  Food: COLORS.warning,
  Hotel: COLORS.accent,
  Tickets: COLORS.success,
  Misc: COLORS.textSecondary,
};

export default function ExpenseCard({ expense, onApprove, onReject, showActions = false }) {
  const icon = TYPE_ICON[expense.type] || 'receipt';
  const color = TYPE_COLOR[expense.type] || COLORS.textSecondary;

  return (
    <View style={[styles.card, SHADOW.sm]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.type}>{expense.type}</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {expense.description || 'No description'}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
          <StatusBadge status={expense.status} />
        </View>
        {expense.submittedBy && (
          <Text style={styles.submittedBy}>By {expense.submittedBy}</Text>
        )}
      </View>
      {showActions && expense.status === 'pending' && (
        <View style={styles.actions}>
          {onApprove && (
            <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
            </TouchableOpacity>
          )}
          {onReject && (
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
              <Ionicons name="close" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
  },
  left: { marginRight: SPACING.sm },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontWeight: '700', color: COLORS.textPrimary, fontSize: FONTS.sm },
  amount: { fontWeight: '800', color: COLORS.primary, fontSize: FONTS.base },
  description: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs },
  date: { color: COLORS.textMuted, fontSize: FONTS.xs },
  submittedBy: { color: COLORS.textMuted, fontSize: FONTS.xs, marginTop: 2 },
  actions: { flexDirection: 'column', gap: SPACING.xs, marginLeft: SPACING.sm },
  actionBtn: { padding: 6, borderRadius: RADIUS.sm },
  approveBtn: { backgroundColor: COLORS.successBg },
  rejectBtn: { backgroundColor: COLORS.dangerBg },
});
