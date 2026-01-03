import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { Package, DollarSign, MapPin, Users, Search, X } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';
import type { TourPackage } from '../../src/types';

export default function DashboardScreen() {
    const { packages, expenses, places, addPlace, clearPlaces, user } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');

    const stats = {
        totalPackages: packages.length,
        totalMembers: packages.reduce((sum, pkg) => sum + (Array.isArray(pkg.members) ? pkg.members.length : 0), 0),
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        ongoingTrips: packages.filter(p => p.status === 'Ongoing').length,
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            addPlace({
                name: searchQuery,
                coordinates: [0, 0], // Demo coordinates
            });
            Alert.alert('Place Added', `${searchQuery} added to search results`);
        }
    };

    const filteredPackages = packages.filter(pkg => {
        if (filterStatus !== 'All' && pkg.status !== filterStatus) return false;
        return true;
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>Welcome, {user?.username}!</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Package size={24} color={colors.light.primary} />
                        <Text style={styles.statValue}>{stats.totalPackages}</Text>
                        <Text style={styles.statLabel}>Tour Packages</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Users size={24} color={colors.light.info} />
                        <Text style={styles.statValue}>{stats.totalMembers}</Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                    <View style={styles.statCard}>
                        <DollarSign size={24} color={colors.light.success} />
                        <Text style={styles.statValue}>₹{(stats.totalExpenses / 1000).toFixed(0)}K</Text>
                        <Text style={styles.statLabel}>Expenses</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MapPin size={24} color={colors.light.warning} />
                        <Text style={styles.statValue}>{stats.ongoingTrips}</Text>
                        <Text style={styles.statLabel}>Ongoing</Text>
                    </View>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <Text style={styles.sectionTitle}>Search Places</Text>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search for a place..."
                            placeholderTextColor={colors.light.textSecondary}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Search size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    {places.length > 0 && (
                        <View style={styles.placesContainer}>
                            <View style={styles.placesHeader}>
                                <Text style={styles.placesCount}>{places.length} places found</Text>
                                <TouchableOpacity onPress={clearPlaces}>
                                    <Text style={styles.clearButton}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                            {places.map(place => (
                                <View key={place.id} style={styles.placeCard}>
                                    <MapPin size={16} color={colors.light.primary} />
                                    <Text style={styles.placeName}>{place.name}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Filter */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Tour Packages</Text>
                    <View style={styles.filterButtons}>
                        {['All', 'Ongoing', 'Up-Coming', 'Completed'].map(status => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterButton,
                                    filterStatus === status && styles.filterButtonActive,
                                ]}
                                onPress={() => setFilterStatus(status)}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        filterStatus === status && styles.filterButtonTextActive,
                                    ]}
                                >
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Tour Packages */}
                <View style={styles.packagesSection}>
                    {filteredPackages.map(pkg => (
                        <TourCard key={pkg.id} tour={pkg} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

function TourCard({ tour }: { tour: TourPackage }) {
    const statusColors = {
        'Ongoing': colors.light.success,
        'Up-Coming': colors.light.info,
        'Completed': colors.light.textSecondary,
    };

    return (
        <View style={styles.tourCard}>
            <View style={styles.tourHeader}>
                <Text style={styles.tourName}>{tour.name}</Text>
                <View style={[styles.badge, { backgroundColor: statusColors[tour.status] }]}>
                    <Text style={styles.badgeText}>{tour.status}</Text>
                </View>
            </View>
            <Text style={styles.tourDestination}>{tour.destination}</Text>
            <View style={styles.tourInfo}>
                <Text style={styles.tourInfoText}>👥 {Array.isArray(tour.members) ? tour.members.length : 0} members</Text>
                <Text style={styles.tourInfoText}>⏱️ {tour.durationDays} days</Text>
                <Text style={styles.tourInfoText}>💰 ₹{tour.pricePerPerson.toLocaleString()}</Text>
            </View>
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
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.light.card,
        padding: spacing.md,
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
    searchSection: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.light.text,
    },
    searchButton: {
        backgroundColor: colors.light.primary,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placesContainer: {
        marginTop: spacing.md,
        backgroundColor: colors.light.card,
        borderRadius: 8,
        padding: spacing.md,
    },
    placesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    placesCount: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
    },
    clearButton: {
        fontSize: typography.sizes.sm,
        color: colors.light.primary,
        fontWeight: typography.weights.semibold,
    },
    placeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    placeName: {
        fontSize: typography.sizes.md,
        color: colors.light.text,
    },
    filterSection: {
        padding: spacing.md,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    filterButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    filterButtonActive: {
        backgroundColor: colors.light.primary,
        borderColor: colors.light.primary,
    },
    filterButtonText: {
        fontSize: typography.sizes.sm,
        color: colors.light.text,
        fontWeight: typography.weights.medium,
    },
    filterButtonTextActive: {
        color: '#ffffff',
    },
    packagesSection: {
        padding: spacing.md,
        gap: spacing.md,
    },
    tourCard: {
        backgroundColor: colors.light.card,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tourHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    tourName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        flex: 1,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
    },
    tourDestination: {
        fontSize: typography.sizes.md,
        color: colors.light.textSecondary,
        marginBottom: spacing.sm,
    },
    tourInfo: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    tourInfoText: {
        fontSize: typography.sizes.sm,
        color: colors.light.textSecondary,
    },
});
