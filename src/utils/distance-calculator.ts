/**
 * Distance Calculator Utility
 * Calculates great-circle distance between two points and recommends transport modes
 */

export type TransportMode = 'road' | 'train' | 'flight' | 'multi-modal';

export interface TransportRecommendation {
    distance: number; // in kilometers
    recommendedMode: TransportMode;
    alternativeModes: TransportMode[];
    requiresAirport: boolean;
    requiresRailway: boolean;
    estimatedDuration: string;
}

/**
 * Calculate great-circle distance between two coordinates using Haversine formula
 * @param lat1 Source latitude
 * @param lon1 Source longitude
 * @param lat2 Destination latitude
 * @param lon2 Destination longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Get recommended transport modes based on distance
 * @param distance Distance in kilometers
 * @returns Transport recommendation object
 */
export function getTransportRecommendation(
    distance: number
): TransportRecommendation {
    // Distance-based logic
    if (distance < 300) {
        // Short distance - Road only
        return {
            distance,
            recommendedMode: 'road',
            alternativeModes: [],
            requiresAirport: false,
            requiresRailway: false,
            estimatedDuration: `${Math.round(distance / 60)} hours`,
        };
    } else if (distance >= 300 && distance < 800) {
        // Medium distance - Train or Road
        return {
            distance,
            recommendedMode: 'train',
            alternativeModes: ['road'],
            requiresAirport: false,
            requiresRailway: true,
            estimatedDuration: `${Math.round(distance / 80)} hours`,
        };
    } else if (distance >= 800 && distance < 2000) {
        // Long distance - Train recommended, Flight alternative
        return {
            distance,
            recommendedMode: 'train',
            alternativeModes: ['flight', 'road'],
            requiresAirport: true,
            requiresRailway: true,
            estimatedDuration: `${Math.round(distance / 80)} hours by train`,
        };
    } else {
        // Very long distance / International - Flight required
        return {
            distance,
            recommendedMode: 'multi-modal',
            alternativeModes: ['flight'],
            requiresAirport: true,
            requiresRailway: false,
            estimatedDuration: `${Math.round(distance / 800)} hours`,
        };
    }
}

/**
 * Check if coordinates are in India (approximate bounds)
 * @param lat Latitude
 * @param lon Longitude
 * @returns True if coordinates are in India
 */
export function isInIndia(lat: number, lon: number): boolean {
    // India's approximate boundaries
    const indiaBounds = {
        minLat: 6.5,
        maxLat: 35.5,
        minLon: 68.0,
        maxLon: 97.5,
    };

    return (
        lat >= indiaBounds.minLat &&
        lat <= indiaBounds.maxLat &&
        lon >= indiaBounds.minLon &&
        lon <= indiaBounds.maxLon
    );
}

/**
 * Determine if route is international
 * @param sourceLat Source latitude
 * @param sourceLon Source longitude
 * @param destLat Destination latitude
 * @param destLon Destination longitude
 * @returns True if route crosses international borders
 */
export function isInternationalRoute(
    sourceLat: number,
    sourceLon: number,
    destLat: number,
    destLon: number
): boolean {
    const sourceInIndia = isInIndia(sourceLat, sourceLon);
    const destInIndia = isInIndia(destLat, destLon);

    return sourceInIndia !== destInIndia;
}
