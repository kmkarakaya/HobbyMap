/**
 * Client-side geocoding service using OpenStreetMap Nominatim API
 */

/**
 * Convert a location string to latitude and longitude coordinates
 * @param {string} location - Location name (city, address, etc.)
 * @returns {Promise<{latitude: number, longitude: number}>} - Coordinates
 */
export const geocodeLocation = async (placeOrLocation, country) => {
  try {
    const q = country ? `${placeOrLocation}, ${country}` : placeOrLocation;
    // Using OpenStreetMap Nominatim API (free and open source)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }

    // Return null coordinates if no results found
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error("Geocoding error:", error);
    return { latitude: null, longitude: null };
  }
};

/**
 * Convert latitude and longitude to a location name (reverse geocoding)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} - Location name
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "";
  }
};
