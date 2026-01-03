/**
 * Airport Finder Utility
 * Find nearest airports for multi-modal routing
 */

export interface Airport {
    code: string; // IATA code
    name: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
    type: 'domestic' | 'international';
}

export interface AirportPair {
    sourceAirport: Airport;
    destAirport: Airport;
    roadToSourceAirport: number; // km
    roadFromDestAirport: number; // km
}

/**
 * Major Indian Airports (Domestic and International)
 */
export const INDIAN_AIRPORTS: Airport[] = [
    // International Hubs
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1000, type: 'international' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, type: 'international' },
    { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9941, lon: 80.1709, type: 'international' },
    { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', lat: 13.1979, lon: 77.7063, type: 'international' },
    { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lon: 78.4294, type: 'international' },
    { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', lat: 22.6547, lon: 88.4467, type: 'international' },
    { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', lat: 10.1520, lon: 76.3872, type: 'international' },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', lat: 23.0772, lon: 72.6347, type: 'international' },

    // Major Domestic Airports
    { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', lat: 18.5821, lon: 73.9197, type: 'domestic' },
    { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', lat: 15.3808, lon: 73.8314, type: 'international' },
    { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', lat: 26.8242, lon: 75.8122, type: 'international' },
    { code: 'IXC', name: 'Chandigarh International Airport', city: 'Chandigarh', country: 'India', lat: 30.6735, lon: 76.7884, type: 'international' },
    { code: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', country: 'India', lat: 33.9871, lon: 74.7742, type: 'domestic' },
    { code: 'IXB', name: 'Bagdogra Airport', city: 'Bagdogra', country: 'India', lat: 26.6812, lon: 88.3286, type: 'domestic' },
    { code: 'TRV', name: 'Trivandrum International Airport', city: 'Trivandrum', country: 'India', lat: 8.4821, lon: 76.9200, type: 'international' },
];

/**
 * Major International Airports (outside India)
 */
export const INTERNATIONAL_AIRPORTS: Airport[] = [
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, lon: 55.3657, type: 'international' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, type: 'international' },
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', lat: 51.4700, lon: -0.4543, type: 'international' },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781, type: 'international' },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lon: 101.7072, type: 'international' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, type: 'international' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', lat: 22.3080, lon: 113.9185, type: 'international' },
];

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find nearest airport to a given location
 * @param lat Latitude
 * @param lon Longitude
 * @param scope 'domestic' for India only, 'international' for worldwide
 * @returns Nearest airport
 */
export function findNearestAirport(
    lat: number,
    lon: number,
    scope: 'domestic' | 'international' = 'domestic'
): Airport | null {
    const airportList = scope === 'domestic'
        ? INDIAN_AIRPORTS
        : [...INDIAN_AIRPORTS, ...INTERNATIONAL_AIRPORTS];

    let nearestAirport: Airport | null = null;
    let minDistance = Infinity;

    for (const airport of airportList) {
        const distance = calculateDistance(lat, lon, airport.lat, airport.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearestAirport = airport;
        }
    }

    return nearestAirport;
}

/**
 * Find the best airport pair for a route
 * @param sourceLat Source latitude
 * @param sourceLon Source longitude
 * @param destLat Destination latitude
 * @param destLon Destination longitude
 * @returns Airport pair with distances
 */
export function getNearestAirportPair(
    sourceLat: number,
    sourceLon: number,
    destLat: number,
    destLon: number
): AirportPair | null {
    // Determine if international route
    const isIndia = (lat: number, lon: number) => {
        return lat >= 6.5 && lat <= 35.5 && lon >= 68.0 && lon <= 97.5;
    };

    const sourceInIndia = isIndia(sourceLat, sourceLon);
    const destInIndia = isIndia(destLat, destLon);
    const scope: 'domestic' | 'international' =
        sourceInIndia && destInIndia ? 'domestic' : 'international';

    const sourceAirport = findNearestAirport(sourceLat, sourceLon, scope);
    const destAirport = findNearestAirport(destLat, destLon, scope);

    if (!sourceAirport || !destAirport) {
        return null;
    }

    const roadToSourceAirport = calculateDistance(
        sourceLat,
        sourceLon,
        sourceAirport.lat,
        sourceAirport.lon
    );

    const roadFromDestAirport = calculateDistance(
        destLat,
        destLon,
        destAirport.lat,
        destAirport.lon
    );

    return {
        sourceAirport,
        destAirport,
        roadToSourceAirport: Math.round(roadToSourceAirport * 10) / 10,
        roadFromDestAirport: Math.round(roadFromDestAirport * 10) / 10,
    };
}

/**
 * Get airport by IATA code
 * @param code Airport IATA code
 * @returns Airport or null
 */
export function getAirportByCode(code: string): Airport | null {
    const allAirports = [...INDIAN_AIRPORTS, ...INTERNATIONAL_AIRPORTS];
    return allAirports.find(a => a.code === code) || null;
}
