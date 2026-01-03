import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { X } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';

export default function CalendarScreen() {
    const { packages, user } = useApp();
    const [selectedDate, setSelectedDate] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [tripName, setTripName] = useState('');

    const markedDates: any = {};
    packages.forEach(pkg => {
        if (pkg.startDate) {
            const date = pkg.startDate.split('T')[0];
            markedDates[date] = {
                marked: true,
                dotColor: pkg.status === 'Ongoing' ? colors.light.success : colors.light.info,
            };
        }
    });

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setShowModal(true);
    };

    const handleSchedule = () => {
        if (tripName.trim()) {
            Alert.alert('Trip Scheduled', `${tripName} scheduled for ${selectedDate}`);
            setShowModal(false);
            setTripName('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Travel Calendar</Text>
                <Text style={styles.headerSubtitle}>Plan your trips</Text>
            </View>

            <ScrollView style={styles.content}>
                <RNCalendar
                    onDayPress={handleDayPress}
                    markedDates={markedDates}
                    theme={{
                        backgroundColor: colors.light.background,
                        calendarBackground: colors.light.card,
                        textSectionTitleColor: colors.light.text,
                        selectedDayBackgroundColor: colors.light.primary,
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: colors.light.primary,
                        dayTextColor: colors.light.text,
                        textDisabledColor: colors.light.textSecondary,
                        dotColor: colors.light.primary,
                        monthTextColor: colors.light.text,
                        textMonthFontWeight: 'bold',
                    }}
                />

                <View style={styles.tripsSection}>
                    <Text style={styles.sectionTitle}>Upcoming Trips</Text>
                    {packages
                        .filter(pkg => pkg.status === 'Up-Coming' || pkg.status === 'Ongoing')
                        .map(pkg => (
                            <View key={pkg.id} style={styles.tripCard}>
                                <Text style={styles.tripName}>{pkg.name}</Text>
                                <Text style={styles.tripDate}>
                                    {pkg.startDate ? new Date(pkg.startDate).toLocaleDateString() : 'No date'}
                                </Text>
                                <Text style={styles.tripDestination}>{pkg.destination}</Text>
                            </View>
                        ))}
                </View>
            </ScrollView>

            {/* Schedule Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule Trip for {selectedDate}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <X size={24} color={colors.light.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={tripName}
                            onChangeText={setTripName}
                            placeholder="Trip name"
                            placeholderTextColor={colors.light.textSecondary}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleSchedule}>
                            <Text style={styles.buttonText}>Schedule Trip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    tripsSection: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    tripCard: {
        backgroundColor: colors.light.card,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tripName: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
    },
    tripDate: {
        fontSize: typography.sizes.sm,
        color: colors.light.primary,
        marginTop: spacing.xs,
    },
    tripDestination: {
        fontSize: typography.sizes.md,
        color: colors.light.textSecondary,
        marginTop: spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.light.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.lg,
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.light.text,
    },
    input: {
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        marginBottom: spacing.lg,
        color: colors.light.text,
    },
    button: {
        backgroundColor: colors.light.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
    },
});
