import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Navigation } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { colors, spacing, typography } from '../../src/theme';

const { width, height } = Dimensions.get('window');

export default function GuideScreen() {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: 11.0168,
        longitude: 76.9558,
        latitudeDelta: 2,
        longitudeDelta: 2,
    });

    const handlePlanRoute = () => {
        if (!source || !destination) {
            Alert.alert('Error', 'Please enter both source and destination');
            return;
        }

        setShowMap(true);
        Alert.alert(
            'Route Planned',
            `Route from ${source} to ${destination}\n\nDistance: ~200 km\nDuration: ~4 hours\nEstimated Cost: ₹5,000`
        );
    };

    const demoRoute = [
        { latitude: 11.0168, longitude: 76.9558 },
        { latitude: 11.4, longitude: 77.2 },
        { latitude: 11.8, longitude: 77.5 },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Route Planner</Text>
                <Text style={styles.headerSubtitle}>AI-powered trip planning</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.form}>
                    <Text style={styles.label}>Source</Text>
                    <TextInput
                        style={styles.input}
                        value={source}
                        onChangeText={setSource}
                        placeholder="Enter source location"
                        placeholderTextColor={colors.light.textSecondary}
                    />

                    <Text style={styles.label}>Destination</Text>
                    <TextInput
                        style={styles.input}
                        value={destination}
                        onChangeText={setDestination}
                        placeholder="Enter destination"
                        placeholderTextColor={colors.light.textSecondary}
                    />

                    <TouchableOpacity style={styles.button} onPress={handlePlanRoute}>
                        <Navigation size={20} color="#ffffff" />
                        <Text style={styles.buttonText}>Plan Route</Text>
                    </TouchableOpacity>
                </View>

                {showMap && (
                    <View style={styles.mapContainer}>
                        <Text style={styles.mapTitle}>Route Map</Text>
                        <MapView
                            style={styles.map}
                            region={mapRegion}
                            onRegionChangeComplete={setMapRegion}
                        >
                            <Marker
                                coordinate={demoRoute[0]}
                                title="Source"
                                pinColor={colors.light.primary}
                            />
                            <Marker
                                coordinate={demoRoute[demoRoute.length - 1]}
                                title="Destination"
                                pinColor={colors.light.error}
                            />
                            <Polyline
                                coordinates={demoRoute}
                                strokeColor={colors.light.primary}
                                strokeWidth={3}
                            />
                        </MapView>

                        <View style={styles.routeInfo}>
                            <Text style={styles.routeInfoText}>📍 Distance: ~200 km</Text>
                            <Text style={styles.routeInfoText}>⏱️ Duration: ~4 hours</Text>
                            <Text style={styles.routeInfoText}>💰 Est. Cost: ₹5,000</Text>
                        </View>
                    </View>
                )}
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
    },
    form: {
        padding: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
        color: colors.light.text,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.sizes.md,
        marginBottom: spacing.md,
        color: colors.light.text,
    },
    button: {
        backgroundColor: colors.light.primary,
        flexDirection: 'row',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
    },
    mapContainer: {
        padding: spacing.md,
    },
    mapTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        color: colors.light.text,
        marginBottom: spacing.md,
    },
    map: {
        width: width - spacing.lg * 2,
        height: 300,
        borderRadius: 12,
    },
    routeInfo: {
        backgroundColor: colors.light.card,
        padding: spacing.md,
        borderRadius: 12,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    routeInfoText: {
        fontSize: typography.sizes.md,
        color: colors.light.text,
    },
});
