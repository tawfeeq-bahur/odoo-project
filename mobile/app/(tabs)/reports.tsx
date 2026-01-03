import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const { expenses } = useApp();

    const expenseByCategory = expenses.reduce((acc: any, exp) => {
        acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
        return acc;
    }, {});

    const chartData = Object.entries(expenseByCategory).map(([name, amount], index) => ({
        name,
        amount: amount as number,
        color: [colors.light.primary, colors.light.info, colors.light.warning, colors.light.error, colors.light.success][index % 5],
        legendFontColor: colors.light.text,
        legendFontSize: 14,
    }));

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reports & Analytics</Text>
                <Text style={styles.headerSubtitle}>Track your expenses</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Expense Summary</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₹{(totalExpenses / 1000).toFixed(1)}K</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.light.success }]}>
                                ₹{(approvedExpenses / 1000).toFixed(1)}K
                            </Text>
                            <Text style={styles.statLabel}>Approved</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.light.warning }]}>
                                ₹{(pendingExpenses / 1000).toFixed(1)}K
                            </Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>
                </View>

                {chartData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Expenses by Category</Text>
                        <PieChart
                            data={chartData}
                            width={width - spacing.lg * 4}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                )}

                <View style={styles.listCard}>
                    <Text style={styles.cardTitle}>Recent Expenses</Text>
                    {expenses.slice(0, 10).map(exp => (
                        <View key={exp.id} style={styles.expenseItem}>
                            <View style={styles.expenseInfo}>
                                <Text style={styles.expenseName}>{exp.description}</Text>
                                <Text style={styles.expenseType}>{exp.type} • {exp.date}</Text>
                            </View>
                            <Text style={styles.expenseAmount}>₹{exp.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.light.primary,
    },
    headerTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: '#ffffff',
    },
    headerSubtitle: {
        fontSize: typography.sizes.md,
        color: '#ffffff',
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    statsCard: {
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.light.text,
    },
    statLabel: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
        marginTop: spacing.xs,
    },
    chartCard: {
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    listCard: {
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseName: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.light.text,
    },
    expenseType: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
        marginTop: spacing.xs,
    },
    expenseAmount: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.semibold,
        color: colors.light.primary,
    },
});
