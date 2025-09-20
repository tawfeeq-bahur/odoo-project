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
function createPoliceIcon(size = 30) {
  // Create a custom SVG icon for police stations
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="#1e40af" stroke="#ffffff" stroke-width="2"/>
      <path d="M10 12h10v2H10v-2zm0 4h10v2H10v-2zm2-8h6v2h-6V8z" fill="#ffffff"/>
      <circle cx="15" cy="15" r="3" fill="#ffffff"/>
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
 * @returns {Promise<L.LayerGroup>} Layer group containing police station markers
 */
async function showPoliceStationsOnMap(map, lat, lng, radius = 5000) {
  // Create a layer group for police stations
  const policeLayer = L.layerGroup();
  
  try {
    const policeStations = await fetchPoliceStations(lat, lng, radius);
    
    policeStations.forEach(station => {
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
        icon: createPoliceIcon(30)
      });

      // Create popup with station information
      const popupContent = `
        <div style="min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">${stationName}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            <strong>Coordinates:</strong><br>
            ${stationLat.toFixed(6)}, ${stationLng.toFixed(6)}
          </p>
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
    
    console.log(`Added ${policeStations.length} police stations to map`);
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

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchPoliceStations,
    showPoliceStationsOnMap,
    fetchAmenities,
    showAmenitiesOnMap,
    createPoliceIcon,
    createCustomIcon,
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
    DEFAULT_LAT,
    DEFAULT_LNG
  };
}
