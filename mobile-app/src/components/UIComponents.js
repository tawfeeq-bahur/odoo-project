import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/colors';

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export function LoadingSpinner({ message = 'Loading…', size = 'large', style }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message ? <Text style={styles.loadingText}>{message}</Text> : null}
    </View>
  );
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ message, onRetry, style }) {
  return (
    <View style={[styles.errorBox, style]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action, actionLabel, style }) {
  return (
    <View style={[styles.center, styles.emptyBox, style]}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      {title && <Text style={styles.emptyTitle}>{title}</Text>}
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity style={styles.actionBtn} onPress={action}>
          <Text style={styles.actionText}>{actionLabel || 'Action'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = COLORS.primary, style }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }, SHADOW.sm, style]}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status, style }) {
  const STATUS_MAP = {
    active: { bg: COLORS.successBg, text: COLORS.success },
    planning: { bg: COLORS.infoBg, text: COLORS.info },
    ongoing: { bg: '#cffafe', text: COLORS.accent },
    completed: { bg: '#f1f5f9', text: COLORS.textSecondary },
    cancelled: { bg: COLORS.dangerBg, text: COLORS.danger },
    pending: { bg: COLORS.warningBg, text: COLORS.warning },
    approved: { bg: COLORS.successBg, text: COLORS.success },
    rejected: { bg: COLORS.dangerBg, text: COLORS.danger },
  };
  const s = STATUS_MAP[status?.toLowerCase()] || { bg: '#f1f5f9', text: '#64748b' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.badgeText, { color: s.text }]}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[styles.card, SHADOW.sm, style]}>
      {children}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, actionLabel, style }) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={styles.sectionAction}>{actionLabel || 'See All'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, disabled, style, textStyle, color }) {
  const bg = color || COLORS.primary;
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, { backgroundColor: bg }, disabled && styles.disabledBtn, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Text style={[styles.primaryBtnText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── OutlineButton ────────────────────────────────────────────────────────────
export function OutlineButton({ title, onPress, loading, disabled, style, color }) {
  const borderColor = color || COLORS.primary;
  return (
    <TouchableOpacity
      style={[styles.outlineBtn, { borderColor }, disabled && styles.disabledBtn, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={borderColor} />
      ) : (
        <Text style={[styles.outlineBtnText, { color: borderColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export { default as AppTextInput } from './AppTextInput';

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },

  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary, fontSize: FONTS.sm },

  errorBox: {
    margin: SPACING.base,
    padding: SPACING.lg,
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  errorIcon: { fontSize: 28, marginBottom: SPACING.sm },
  errorText: { color: COLORS.danger, textAlign: 'center', fontSize: FONTS.sm, fontWeight: '500' },
  retryBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
  },
  retryText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sm },

  emptyBox: { padding: SPACING['2xl'] },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { marginTop: SPACING.xs, color: COLORS.textSecondary, textAlign: 'center', fontSize: FONTS.sm },
  actionBtn: {
    marginTop: SPACING.base,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  actionText: { color: COLORS.white, fontWeight: '700' },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    minWidth: 90,
  },
  statIcon: { fontSize: 22, marginBottom: SPACING.xs },
  statValue: { fontSize: FONTS['2xl'], fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },

  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: FONTS.xs, fontWeight: '700', textTransform: 'capitalize' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },
  sectionAction: { fontSize: FONTS.sm, color: COLORS.primary, fontWeight: '600' },

  primaryBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.base },
  disabledBtn: { opacity: 0.5 },
  outlineBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { fontWeight: '700', fontSize: FONTS.base },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
});
