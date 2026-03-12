import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';
import { StatCard, SectionHeader, Card, EmptyState } from '../components/UIComponents';
import ExpenseCard from '../components/ExpenseCard';
import { formatCurrency, getExpensesByCategory, groupBy } from '../utils/helpers';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CHART_CONFIG = {
  backgroundColor: COLORS.surface,
  backgroundGradientFrom: COLORS.surface,
  backgroundGradientTo: COLORS.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  style: { borderRadius: RADIUS.md },
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
};

const PIE_COLORS = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5];

export default function ReportsScreen({ navigation }) {
  const { packages, expenses } = useAppState();
  const { user } = useAuth();
  const [selectedTourId, setSelectedTourId] = useState('all');

  const myTours = packages.filter((p) => p.organizerName === user?.username);
  const filteredExpenses = selectedTourId === 'all'
    ? expenses
    : expenses.filter((e) => e.tourId === selectedTourId);

  const approvedExpenses = filteredExpenses.filter((e) => e.status === 'approved');
  const pendingExpenses = filteredExpenses.filter((e) => e.status === 'pending');
  const totalApproved = approvedExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  // Bar chart — monthly spending
  const monthly = groupBy(approvedExpenses, (e) => {
    const d = new Date(e.date);
    return `${d.getMonth() + 1}/${d.getFullYear() % 100}`;
  });
  const monthLabels = Object.keys(monthly).slice(-6);
  const monthData = monthLabels.map((k) =>
    monthly[k].reduce((s, e) => s + Number(e.amount || 0), 0)
  );

  // Pie chart — by category
  const categories = getExpensesByCategory(approvedExpenses);
  const pieData = categories.slice(0, 5).map((cat, i) => ({
    name: cat.name,
    population: cat.total,
    color: PIE_COLORS[i],
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tour selector */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[{ id: 'all', name: 'All Tours' }, ...myTours].map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, selectedTourId === t.id && styles.chipActive]}
                onPress={() => setSelectedTourId(t.id)}
              >
                <Text style={[styles.chipText, selectedTourId === t.id && styles.chipTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard label="Approved" value={formatCurrency(totalApproved)} icon="✅" color={COLORS.success} />
            <StatCard label="Pending" value={pendingExpenses.length} icon="⏳" color={COLORS.warning} />
            <StatCard label="Total" value={filteredExpenses.length} icon="📋" color={COLORS.primary} />
          </View>

          {/* Bar chart */}
          {monthData.length > 0 && (
            <>
              <SectionHeader title="Monthly Spending" />
              <Card style={styles.chartCard}>
                <BarChart
                  data={{
                    labels: monthLabels.length > 0 ? monthLabels : ['No data'],
                    datasets: [{ data: monthData.length > 0 ? monthData : [0] }],
                  }}
                  width={SCREEN_WIDTH - SPACING.base * 2 - SPACING.base * 2 - 8}
                  height={180}
                  chartConfig={CHART_CONFIG}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
              </Card>
            </>
          )}

          {/* Pie chart */}
          {pieData.length > 0 && (
            <>
              <SectionHeader title="Spending by Category" />
              <Card style={styles.chartCard}>
                <PieChart
                  data={pieData}
                  width={SCREEN_WIDTH - SPACING.base * 2 - SPACING.base * 2 - 8}
                  height={180}
                  chartConfig={CHART_CONFIG}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="12"
                />
              </Card>
            </>
          )}

          {/* Expenses table */}
          <SectionHeader title="Expense List" />
          {filteredExpenses.length === 0 ? (
            <EmptyState icon="💸" title="No expenses found" />
          ) : (
            filteredExpenses.map((exp) => (
              <ExpenseCard key={exp.id} expense={exp} />
            ))
          )}
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  selectorContainer: {
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.xs,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: FONTS.xs, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  content: { padding: SPACING.base },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  chartCard: { padding: SPACING.sm, overflow: 'hidden' },
  chart: { borderRadius: RADIUS.md },
});
