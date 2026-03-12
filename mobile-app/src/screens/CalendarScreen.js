import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { StatusBadge, EmptyState } from '../components/UIComponents';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const STATUS_BG = {
  active: COLORS.success,
  planning: COLORS.primary,
  completed: COLORS.textMuted,
  cancelled: COLORS.danger,
  ongoing: COLORS.accent,
};

export default function CalendarScreen({ navigation }) {
  const { packages } = useAppState();
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedTour, setSelectedTour] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const getToursForDate = (day) => {
    const date = new Date(year, month, day);
    return packages.filter((p) => {
      if (!p.startDate || !p.endDate) return false;
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return date >= start && date <= end;
    });
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day) =>
    day &&
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month navigator */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            const tours = day ? getToursForDate(day) : [];
            const todayCell = isToday(day);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.cell,
                  todayCell && styles.todayCell,
                  !day && styles.emptyCell,
                ]}
                onPress={() => day && tours.length > 0 && setSelectedTour(tours[0])}
                disabled={!day}
                activeOpacity={0.7}
              >
                {day && (
                  <>
                    <Text style={[styles.dayNum, todayCell && styles.todayNum]}>{day}</Text>
                    {tours.slice(0, 2).map((t, i) => (
                      <View
                        key={i}
                        style={[styles.tourDot, { backgroundColor: STATUS_BG[t.status] || COLORS.primary }]}
                      />
                    ))}
                    {tours.length > 2 && (
                      <Text style={styles.moreDots}>+{tours.length - 2}</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected tour info */}
        {selectedTour && (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedName}>{selectedTour.name}</Text>
              <TouchableOpacity onPress={() => setSelectedTour(null)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedDestination}>📍 {selectedTour.destination}</Text>
            <View style={styles.selectedRow}>
              <StatusBadge status={selectedTour.status} />
              <Text style={styles.selectedDates}>
                {selectedTour.startDate} → {selectedTour.endDate}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewTourBtn}
              onPress={() => navigation.navigate('HomeTab', { screen: 'TourDetail', params: { tourId: selectedTour.id } })}
            >
              <Text style={styles.viewTourText}>View Tour Details →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming tours list */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>Upcoming Tours</Text>
          {packages
            .filter((p) => p.status !== 'completed' && p.status !== 'cancelled')
            .slice(0, 5)
            .map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.upcomingRow}
                onPress={() => navigation.navigate('HomeTab', { screen: 'TourDetail', params: { tourId: p.id } })}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_BG[p.status] || COLORS.primary }]} />
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingName}>{p.name}</Text>
                  <Text style={styles.upcomingDate}>{p.startDate} – {p.endDate}</Text>
                </View>
                <StatusBadge status={p.status} />
              </TouchableOpacity>
            ))}
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = (360 - SPACING.base * 2) / 7;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.base,
  },
  navBtn: { padding: SPACING.xs },
  monthLabel: { fontSize: FONTS.xl, fontWeight: '800', color: COLORS.textPrimary },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xs,
  },
  dayHeader: {
    flex: 1, textAlign: 'center',
    fontSize: FONTS.xs, fontWeight: '700',
    color: COLORS.textMuted, textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.base, marginBottom: SPACING.md,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  emptyCell: {},
  todayCell: { backgroundColor: COLORS.primaryBg },
  dayNum: { fontSize: FONTS.sm, color: COLORS.textPrimary, fontWeight: '500' },
  todayNum: { color: COLORS.primary, fontWeight: '900' },
  tourDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  moreDots: { fontSize: 8, color: COLORS.textMuted },

  selectedCard: {
    margin: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  selectedName: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  selectedDestination: { color: COLORS.textSecondary, fontSize: FONTS.sm, marginBottom: SPACING.sm },
  selectedRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginBottom: SPACING.sm },
  selectedDates: { color: COLORS.textMuted, fontSize: FONTS.xs },
  viewTourBtn: { alignSelf: 'flex-start' },
  viewTourText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sm },

  upcomingSection: { padding: SPACING.base },
  upcomingTitle: { fontSize: FONTS.base, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  upcomingRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  upcomingInfo: { flex: 1 },
  upcomingName: { color: COLORS.textPrimary, fontWeight: '600', fontSize: FONTS.sm },
  upcomingDate: { color: COLORS.textMuted, fontSize: FONTS.xs },
});
