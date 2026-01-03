import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LogOut, User as UserIcon, Package, DollarSign, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';

export default function ProfileScreen() {
    const { user, logout, packages, expenses } = useApp();
    const router = useRouter();

    const myPackages = packages.filter(p => p.organizerName === user?.username);
    const myExpenses = expenses.filter(e => e.submittedBy === user?.username);
    const totalExpenses = myExpenses.reduce((sum, e) => sum + e.amount, 0);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <UserIcon size={48} color="#ffffff" />
                </View>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.role}>Tour Organizer</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <Package size={24} color={colors.light.primary} />
                        <Text style={styles.statValue}>{myPackages.length}</Text>
                        <Text style={styles.statLabel}>My Packages</Text>
                    </View>
                    <View style={styles.statCard}>
                        <DollarSign size={24} color={colors.light.success} />
                        <Text style={styles.statValue}>₹{(totalExpenses / 1000).toFixed(0)}K</Text>
                        <Text style={styles.statLabel}>My Expenses</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Settings size={20} color={colors.light.textSecondary} />
                        <Text style={styles.menuText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <LogOut size={20} color={colors.light.error} />
                        <Text style={[styles.menuText, { color: colors.light.error }]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>About TourJet</Text>
                    <Text style={styles.infoText}>
                        TourJet is your AI-powered travel companion. Plan trips, manage expenses,
                        and coordinate with friends and family seamlessly.
                    </Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
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
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        backgroundColor: colors.light.primary,
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    username: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: '#ffffff',
        marginBottom: spacing.xs,
    },
    role: {
        fontSize: typography.sizes.md,
        color: '#ffffff',
        opacity: 0.9,
    },
    content: {
        flex: 1,
    },
    statsSection: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        color: colors.light.text,
        marginTop: spacing.sm,
    },
    statLabel: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
        marginTop: spacing.xs,
    },
    menuSection: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        padding: spacing.lg,
        borderRadius: 12,
        gap: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuText: {
        fontSize: typography.sizes.md,
        color: colors.light.text,
        fontWeight: typography.weights.medium,
    },
    infoSection: {
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    infoTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    infoText: {
        fontSize: typography.sizes.md,
        color: colors.light.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    version: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
});
