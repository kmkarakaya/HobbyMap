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
    // We'll try to prefer results within the country the user typed (if any).
    // Note: For production, consider a paid geocoding service if you need
    // higher reliability and rate limits.

    // Helper map: common country name -> ISO 2-letter code
    const countryMap = {
      egypt: "eg",
      turkey: "tr",
      greece: "gr",
      italy: "it",
      cyprus: "cy",
      spain: "es",
      france: "fr",
      uk: "gb",
      unitedkingdom: "gb",
      unitedkingdomofgreatbritain: "gb",
      "united states": "us",
      usa: "us",
    };

    // Extract a country hint if the user typed one, e.g. "Sharm El Sheik, Egypt"
    const parts = location
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const countryHintRaw =
      parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
    const countryCodeHint = countryHintRaw
      ? countryMap[countryHintRaw.replace(/\s+/g, "")]
      : null;

    const baseParams = {
      q: location,
      format: "json",
      limit: 1,
      addressdetails: 1,
    };

    const headers = {
      "User-Agent": "ScubaDivingMapApp/1.0",
    };

    // Try primary query: if we have an ISO code, include it as countrycodes
    const tryQuery = async (params) => {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params,
          headers,
        }
      );
      return res.data;
    };

    let results = [];
    try {
      const params = { ...baseParams };
      if (countryCodeHint) params.countrycodes = countryCodeHint;
      results = await tryQuery(params);
    } catch (e) {
      // If the query with countrycodes fails for any reason, fall back to base query
      console.warn(
        "Geocode primary query failed, falling back:",
        e.message || e
      );
      results = await tryQuery(baseParams);
    }

    // If we have a result, verify it matches the country hint (if provided)
    if (results && results.length > 0) {
      const r = results[0];
      const addr = r.address || {};
      const matchedCountry = countryHintRaw
        ? (addr.country &&
            addr.country.toLowerCase().includes(countryHintRaw)) ||
          (addr.country_code &&
            addr.country_code.toLowerCase() === countryCodeHint)
        : true;

      if (matchedCountry) {
        return {
          latitude: parseFloat(r.lat),
          longitude: parseFloat(r.lon),
        };
      }
    }

    // If we didn't get a satisfactory result, try again by appending the country
    // hint explicitly to the query (helps when Nominatim mis-parses short names).
    if (countryHintRaw) {
      const qWithCountry =
        parts.length > 1 ? location : `${location}, ${countryHintRaw}`;
      const retryParams = { ...baseParams, q: qWithCountry };
      if (countryCodeHint) retryParams.countrycodes = countryCodeHint;
      const retryResults = await tryQuery(retryParams);
      if (retryResults && retryResults.length > 0) {
        const rr = retryResults[0];
        return {
          latitude: parseFloat(rr.lat),
          longitude: parseFloat(rr.lon),
        };
      }
    }

    // Last attempt: plain query without extras
    const fallback = await tryQuery(baseParams);
    if (fallback && fallback.length > 0) {
      const f = fallback[0];
      return {
        latitude: parseFloat(f.lat),
        longitude: parseFloat(f.lon),
      };
    }

    throw new Error("Location not found");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};
