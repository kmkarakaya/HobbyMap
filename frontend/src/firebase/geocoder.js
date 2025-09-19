// Geocoding utility for locations
import axios from "axios";

/**
 * Geocode a location string into latitude and longitude
 * @param {string} location - Location string to geocode
 * @returns {Promise<Object>} Object with latitude and longitude
 */
export const geocodeLocation = async (location) => {
  if (!location) {
    throw new Error("Location is required for geocoding");
  }

  try {
    // Using Nominatim OpenStreetMap geocoding service (free and open source)
    // Note: For production, you might want to use a paid service with higher limits
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: location,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "ScubaDivingMapApp/1.0", // Custom user agent as per Nominatim policy
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};
