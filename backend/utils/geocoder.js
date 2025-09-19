const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
  httpAdapter: "https",
  formatter: null,
};

const geocoder = NodeGeocoder(options);

/**
 * Geocode a location string to coordinates
 * @param {string} location - Location string (city, address, etc.)
 * @returns {Promise<{latitude: number, longitude: number}>} - Coordinates
 */
const geocodeLocation = async (placeOrLocation, country) => {
  try {
    const q = country ? `${placeOrLocation}, ${country}` : placeOrLocation;
    const res = await geocoder.geocode(q);

    if (res && res.length > 0) {
      const { latitude, longitude } = res[0];
      return { latitude, longitude };
    }

    return { latitude: null, longitude: null };
  } catch (error) {
    console.error("Geocoding error:", error);
    return { latitude: null, longitude: null };
  }
};

module.exports = { geocodeLocation };
