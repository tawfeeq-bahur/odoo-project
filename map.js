/**
 * Modular Map Utilities for NeoThink-TourJet
 * Provides functions for fetching and displaying POIs on Leaflet maps
 */

// Default coordinates (India view)
const DEFAULT_LAT = 20.5937;
const DEFAULT_LNG = 78.9629;

// Overpass API configuration
const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter', 
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass-api.de/api/interpreter' // fallback
];

// Helper function to try multiple Overpass instances
const fetchFromOverpass = async (query, timeout = 30) => {
  for (let i = 0; i < OVERPASS_URLS.length; i++) {
    const url = OVERPASS_URLS[i];
    try {
      console.log(`Trying Overpass instance ${i + 1}/${OVERPASS_URLS.length}: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with instance ${i + 1}: ${url}`);
        return data;
      } else {
        console.warn(`❌ Instance ${i + 1} failed with status ${response.status}: ${url}`);
      }
    } catch (error) {
      console.warn(`❌ Instance ${i + 1} error: ${error.message} - ${url}`);
    }
  }
  
  throw new Error('All Overpass instances failed');
};

/**
 * Fetches police stations from Overpass API around given coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude  
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Array>} Array of police station objects
 */
async function fetchPoliceStations(lat, lng, radius = 5000) {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        way["amenity"="police"](around:${radius},${lat},${lng});
        relation["amenity"="police"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const data = await fetchFromOverpass(overpassQuery, 25);
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching police stations:', error);
    return [];
  }
}

/**
 * Creates a custom police station icon for Leaflet markers
 * @param {number} size - Icon size in pixels (default: 30)
 * @returns {L.Icon} Leaflet icon object
 */
function createPoliceIcon(size = 24) {
  // Create a custom SVG icon for police stations
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
        <linearGradient id="policeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#policeGradient)" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
      <path d="M8 10h8v1.5H8V10zm0 3h8v1.5H8V13zm1.5-6h5v1.5h-5V7z" fill="#ffffff"/>
      <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
      <path d="M10 12h4v1h-4v-1zm0 2h4v1h-4v-1z" fill="#1e40af"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
    className: 'police-station-icon'
  });
}

/**
 * Displays police stations on the map with custom markers
 * @param {L.Map} map - Leaflet map instance
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @param {Array} routePolyline - Optional route polyline for distance filtering
 * @returns {Promise<L.LayerGroup>} Layer group containing police station markers
 */
async function showPoliceStationsOnMap(map, lat, lng, radius = 5000, routePolyline = null) {
  // Create a layer group for police stations
  const policeLayer = L.layerGroup();
  
  try {
    const policeStations = await fetchPoliceStations(lat, lng, radius);
    
    // If we have a route polyline, filter stations by distance to route
    let filteredStations = policeStations;
    if (routePolyline && routePolyline.length > 0) {
      const MAX_DISTANCE_M = 300; // 300m in meters - very strict
      const MAX_STATIONS = 5; // Limit to 5 main police stations
      
      filteredStations = policeStations.filter(station => {
        // Get coordinates - handle both node and way/relation types
        let stationLat, stationLng;
        
        if (station.type === 'node') {
          stationLat = station.lat;
          stationLng = station.lon;
        } else if (station.center) {
          stationLat = station.center.lat;
          stationLng = station.center.lon;
        } else {
          return false; // Skip if no valid coordinates
        }

        // Calculate distance from station to route
        const stationPoint = [stationLat, stationLng];
        const distance = distanceToPolyline(stationPoint, routePolyline);
        
        console.log(`Police station ${station.tags?.name || 'Unknown'} distance to route: ${distance.toFixed(0)}m`);
        return distance <= MAX_DISTANCE_M;
      });
      
      // Sort by distance and limit to MAX_STATIONS
      const stationsWithDistance = filteredStations.map(station => {
        let stationLat, stationLng;
        
        if (station.type === 'node') {
          stationLat = station.lat;
          stationLng = station.lon;
        } else if (station.center) {
          stationLat = station.center.lat;
          stationLng = station.center.lon;
        }
        
        const stationPoint = [stationLat, stationLng];
        const distance = distanceToPolyline(stationPoint, routePolyline);
        
        return { ...station, distance };
      });
      
      // Sort by distance (closest first) and take only the first 5
      filteredStations = stationsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_STATIONS);
      
      console.log(`Filtered police stations from ${policeStations.length} to ${filteredStations.length} (closest 5 within 300m of route)`);
    }
    
    filteredStations.forEach(station => {
      // Get coordinates - handle both node and way/relation types
      let stationLat, stationLng;
      
      if (station.type === 'node') {
        stationLat = station.lat;
        stationLng = station.lon;
      } else if (station.center) {
        stationLat = station.center.lat;
        stationLng = station.center.lon;
      } else {
        return; // Skip if no valid coordinates
      }

      // Get station name from tags
      const stationName = station.tags?.name || 
                         station.tags?.['name:en'] || 
                         station.tags?.['name:hi'] || 
                         'Police Station';

      // Create marker with custom icon
      const marker = L.marker([stationLat, stationLng], {
        icon: createPoliceIcon(24)
      });

      // Calculate distance to route for popup display
      let distanceText = '';
      if (routePolyline && routePolyline.length > 0) {
        const stationPoint = [stationLat, stationLng];
        const distance = distanceToPolyline(stationPoint, routePolyline);
        distanceText = `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
          <strong>Distance from route:</strong> ${distance.toFixed(0)}m
        </p>`;
      }

      // Create popup with station information
      const popupContent = `
        <div style="min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">${stationName}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            <strong>Coordinates:</strong><br>
            ${stationLat.toFixed(6)}, ${stationLng.toFixed(6)}
          </p>
          ${distanceText}
          ${station.tags?.phone ? `
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
              <strong>Phone:</strong> ${station.tags.phone}
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      policeLayer.addLayer(marker);
    });

    // Add the layer group to the map
    map.addLayer(policeLayer);
    
    console.log(`Added ${filteredStations.length} police stations to map (within 300m)`);
    return policeLayer;
    
  } catch (error) {
    console.error('Error showing police stations on map:', error);
    return policeLayer;
  }
}

/**
 * Generic function to fetch any amenity type from Overpass API
 * @param {string} amenity - Amenity type (e.g., 'hospital', 'fuel', 'restaurant')
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<Array>} Array of amenity objects
 */
async function fetchAmenities(amenity, lat, lng, radius = 5000) {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="${amenity}"](around:${radius},${lat},${lng});
        way["amenity"="${amenity}"](around:${radius},${lat},${lng});
        relation["amenity"="${amenity}"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const data = await fetchFromOverpass(overpassQuery, 25);
    return data.elements || [];
  } catch (error) {
    console.error(`Error fetching ${amenity} amenities:`, error);
    return [];
  }
}

/**
 * Generic function to show amenities on map with custom icons
 * @param {L.Map} map - Leaflet map instance
 * @param {string} amenity - Amenity type
 * @param {string} iconColor - Color for the icon (hex color)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000)
 * @returns {Promise<L.LayerGroup>} Layer group containing amenity markers
 */
async function showAmenitiesOnMap(map, amenity, iconColor, lat, lng, radius = 5000) {
  const amenityLayer = L.layerGroup();
  
  try {
    const amenities = await fetchAmenities(amenity, lat, lng, radius);
    
    amenities.forEach(item => {
      let itemLat, itemLng;
      
      if (item.type === 'node') {
        itemLat = item.lat;
        itemLng = item.lon;
      } else if (item.center) {
        itemLat = item.center.lat;
        itemLng = item.center.lon;
      } else {
        return;
      }

      const itemName = item.tags?.name || 
                      item.tags?.['name:en'] || 
                      item.tags?.['name:hi'] || 
                      amenity.charAt(0).toUpperCase() + amenity.slice(1);

      // Create custom icon based on amenity type
      const icon = createCustomIcon(amenity, iconColor, 30);
      
      const marker = L.marker([itemLat, itemLng], { icon });
      
      const popupContent = `
        <div style="min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; color: ${iconColor}; font-weight: bold;">${itemName}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            <strong>Coordinates:</strong><br>
            ${itemLat.toFixed(6)}, ${itemLng.toFixed(6)}
          </p>
          ${item.tags?.phone ? `
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
              <strong>Phone:</strong> ${item.tags.phone}
            </p>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      amenityLayer.addLayer(marker);
    });

    map.addLayer(amenityLayer);
    console.log(`Added ${amenities.length} ${amenity} amenities to map`);
    return amenityLayer;
    
  } catch (error) {
    console.error(`Error showing ${amenity} amenities on map:`, error);
    return amenityLayer;
  }
}

/**
 * Creates a custom icon for different amenity types
 * @param {string} amenity - Amenity type
 * @param {string} color - Icon color (hex)
 * @param {number} size - Icon size in pixels
 * @returns {L.Icon} Leaflet icon object
 */
function createCustomIcon(amenity, color, size = 30) {
  let iconPath = '';
  
  switch (amenity) {
    case 'hospital':
      iconPath = `
        <path d="M15 5l-5 5v10h10V10l-5-5zM12 8h6v2h-6V8zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z" fill="white"/>
        <circle cx="15" cy="15" r="2" fill="${color}"/>
      `;
      break;
    case 'fuel':
      iconPath = `
        <rect x="8" y="10" width="14" height="8" rx="2" fill="white"/>
        <rect x="10" y="12" width="10" height="4" fill="${color}"/>
        <path d="M15 6v4M12 8h6" stroke="white" stroke-width="2"/>
      `;
      break;
    case 'restaurant':
      iconPath = `
        <path d="M8 12h14l-1 8H9l-1-8z" fill="white"/>
        <path d="M10 8h10v4H10V8z" fill="${color}"/>
        <circle cx="15" cy="10" r="1" fill="white"/>
      `;
      break;
    default:
      iconPath = `
        <circle cx="15" cy="15" r="8" fill="white"/>
        <circle cx="15" cy="15" r="4" fill="${color}"/>
      `;
  }

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      ${iconPath}
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
    className: `${amenity}-icon`
  });
}

/**
 * Calculate distance from a point to a polyline
 * @param {Array} point - [lat, lng] coordinates of the point
 * @param {Array} polyline - Array of [lat, lng] coordinates forming the polyline
 * @returns {number} Distance in meters
 */
function distanceToPolyline(point, polyline) {
  const toMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const pointToSegmentDistance = (pt, a, b) => {
    // Approximate using planar projection for small deltas
    const [py, px] = pt;
    const [ay, ax] = a;
    const [by, bx] = b;
    const A = { x: ax, y: ay };
    const B = { x: bx, y: by };
    const P = { x: px, y: py };
    const ABx = B.x - A.x, ABy = B.y - A.y;
    const APx = P.x - A.x, APy = P.y - A.y;
    const ab2 = ABx * ABx + ABy * ABy || 1e-12;
    let t = (APx * ABx + APy * ABy) / ab2;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: A.x + t * ABx, y: A.y + t * ABy };
    return toMeters(P.y, P.x, proj.y, proj.x);
  };

  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < polyline.length; i++) {
    const d = pointToSegmentDistance(point, polyline[i - 1], polyline[i]);
    if (d < best) best = d;
  }
  return best;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchPoliceStations,
    showPoliceStationsOnMap,
    fetchAmenities,
    showAmenitiesOnMap,
    createPoliceIcon,
    createCustomIcon,
    distanceToPolyline,
    DEFAULT_LAT,
    DEFAULT_LNG
  };
}

// Make functions available globally for browser usage
if (typeof window !== 'undefined') {
  window.MapUtils = {
    fetchPoliceStations,
    showPoliceStationsOnMap,
    fetchAmenities,
    showAmenitiesOnMap,
    createPoliceIcon,
    createCustomIcon,
    distanceToPolyline,
    DEFAULT_LAT,
    DEFAULT_LNG
  };
}
