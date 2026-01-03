/**
 * Flight Path Generator Utility
 * Generate realistic flight paths for map display
 */

export type LatLngTuple = [number, number];

/**
 * Generate a curved flight path between two airports
 * Uses great circle route with additional points for smooth curve
 * @param startLat Starting latitude
 * @param startLon Starting longitude
 * @param endLat Ending latitude
 * @param endLon Ending longitude
 * @param numPoints Number of intermediate points (default: 50)
 * @returns Array of [lat, lon] tuples representing the flight path
 */
export function generateFlightPath(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    numPoints: number = 50
): LatLngTuple[] {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRad(startLat);
    const lon1 = toRad(startLon);
    const lat2 = toRad(endLat);
    const lon2 = toRad(endLon);

    // Calculate the great circle distance
    const d = 2 * Math.asin(
        Math.sqrt(
            Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
        )
    );

    const path: LatLngTuple[] = [];

    // Generate intermediate points along the great circle
    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;

        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);

        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lon = Math.atan2(y, x);

        path.push([toDeg(lat), toDeg(lon)]);
    }

    return path;
}

/**
 * Generate a simple curved path (parabolic arc) for shorter distances
 * @param startLat Starting latitude
 * @param startLon Starting longitude
 * @param endLat Ending latitude
 * @param endLon Ending longitude
 * @param numPoints Number of points
 * @param curvature Curvature factor (0-1, default 0.3)
 * @returns Array of [lat, lon] tuples
 */
export function generateCurvedPath(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    numPoints: number = 30,
    curvature: number = 0.3
): LatLngTuple[] {
    const path: LatLngTuple[] = [];

    // Calculate midpoint
    const midLat = (startLat + endLat) / 2;
    const midLon = (startLon + endLon) / 2;

    // Calculate perpendicular offset for curve
    const dLat = endLat - startLat;
    const dLon = endLon - startLon;
    const distance = Math.sqrt(dLat * dLat + dLon * dLon);

    // Perpendicular direction
    const perpLat = -dLon;
    const perpLon = dLat;
    const perpMag = Math.sqrt(perpLat * perpLat + perpLon * perpLon);

    // Control point offset
    const offsetLat = (perpLat / perpMag) * distance * curvature;
    const offsetLon = (perpLon / perpMag) * distance * curvature;

    const controlLat = midLat + offsetLat;
    const controlLon = midLon + offsetLon;

    // Generate quadratic Bezier curve
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const mt = 1 - t;

        const lat = mt * mt * startLat + 2 * mt * t * controlLat + t * t * endLat;
        const lon = mt * mt * startLon + 2 * mt * t * controlLon + t * t * endLon;

        path.push([lat, lon]);
    }

    return path;
}

/**
 * Calculate the distance of a flight path
 * @param path Array of [lat, lon] tuples
 * @returns Distance in kilometers
 */
export function calculatePathDistance(path: LatLngTuple[]): number {
    if (path.length < 2) return 0;

    const R = 6371; // Earth's radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const [lat1, lon1] = path[i];
        const [lat2, lon2] = path[i + 1];

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
    }

    return Math.round(totalDistance * 10) / 10;
}

/**
 * Simplify a path by removing intermediate points (Douglas-Peucker algorithm)
 * @param path Original path
 * @param tolerance Tolerance in degrees (default: 0.01)
 * @returns Simplified path
 */
export function simplifyPath(path: LatLngTuple[], tolerance: number = 0.01): LatLngTuple[] {
    if (path.length <= 2) return path;

    // Find the point with maximum distance from line segment
    let maxDistance = 0;
    let maxIndex = 0;

    const [startLat, startLon] = path[0];
    const [endLat, endLon] = path[path.length - 1];

    for (let i = 1; i < path.length - 1; i++) {
        const distance = perpendicularDistance(path[i], path[0], path[path.length - 1]);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
        const left = simplifyPath(path.slice(0, maxIndex + 1), tolerance);
        const right = simplifyPath(path.slice(maxIndex), tolerance);

        return [...left.slice(0, -1), ...right];
    } else {
        return [path[0], path[path.length - 1]];
    }
}

/**
 * Calculate perpendicular distance from a point to a line
 */
function perpendicularDistance(
    point: LatLngTuple,
    lineStart: LatLngTuple,
    lineEnd: LatLngTuple
): number {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

    const u = ((px - x1) * dx + (py - y1) * dy) / (mag * mag);

    let closestX, closestY;
    if (u < 0) {
        closestX = x1;
        closestY = y1;
    } else if (u > 1) {
        closestX = x2;
        closestY = y2;
    } else {
        closestX = x1 + u * dx;
        closestY = y1 + u * dy;
    }

    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}
