// Geocoding utility for locations
import axios from "axios";

/**
 * Geocode a location string into latitude and longitude
 * @param {string} location - Location string to geocode
 * @returns {Promise<Object>} Object with latitude and longitude
 */
export const geocodeLocation = async (placeOrLocation, countryHint) => {
  // Accept two forms:
  // - geocodeLocation("Sharm El Sheik, Egypt")
  // - geocodeLocation("Sharm El Sheik", "Egypt")
  const place = placeOrLocation || "";
  const countryProvided = countryHint || "";

  if (!place && !countryProvided) {
    throw new Error("Place or country is required for geocoding");
  }

  try {
    const countryMap = {
      egypt: "eg",
      zanzibar: "tz",
      tanzania: "tz",
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

    // Normalize the country to a simple lowercase token for matching
    const normalize = (s) => (s || "").toString().trim().toLowerCase();
    const countryToken = normalize(countryProvided);
    const countryCodeHint = countryToken ? countryMap[countryToken.replace(/\s+/g, "")] : null;

    // Normalize some common transliteration/misspelling variants to improve results
    const normalizePlaceSpelling = (s) => {
      if (!s) return s;
      return s
        .replace(/\bSheik\b/gi, "Sheikh")
        .replace(/\bSharm El Sheik\b/gi, "Sharm el Sheikh")
        .replace(/\bSharm El Sheikh\b/gi, "Sharm el Sheikh");
    };

    // Also normalize Zanzibar variants
    const normalizeZanzibar = (s) => {
      if (!s) return s;
      return s.replace(/\bStone Town\b/gi, 'Zanzibar').replace(/\bZanizbar\b/gi, 'Zanzibar');
    };

  const canonicalPlace = normalizeZanzibar(normalizePlaceSpelling(place));

  // Build the canonical query string. Prefer using separate place + country if provided.
  // (we use `canonicalPlace` directly below)

    // We'll fetch a few results and pick the one that matches the country when possible

    const headers = {
      "User-Agent": "ScubaDivingMapApp/1.0",
    };

    const tryQuery = async (params) => {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params,
        headers,
      });
      return res.data;
    };

    // We'll try a small set of ordered queries and pick a result that matches the country when possible
    const attempts = [];
  // 1) place only, restricted to country code (if available)
  const params1 = { q: canonicalPlace, format: "json", limit: 5, addressdetails: 1 };
    if (countryCodeHint) params1.countrycodes = countryCodeHint;
    attempts.push(params1);

    // 2) place + country string, restricted to country code (if available)
    if (countryProvided) {
      const params2 = { q: `${canonicalPlace}, ${countryProvided}`, format: "json", limit: 5, addressdetails: 1 };
      if (countryCodeHint) params2.countrycodes = countryCodeHint;
      attempts.push(params2);
    }

  // 3) place only, no country restriction
  attempts.push({ q: canonicalPlace, format: "json", limit: 5, addressdetails: 1 });

  // 4) place + country string, no country restriction
  if (countryProvided) attempts.push({ q: `${canonicalPlace}, ${countryProvided}`, format: "json", limit: 5, addressdetails: 1 });

    for (const params of attempts) {
      let results = [];
      try {
        results = await tryQuery(params);
      } catch (e) {
        console.warn("Geocode attempt failed:", e.message || e);
        continue;
      }

      if (!results || results.length === 0) continue;

      // If we have a country hint, prefer any result whose address matches that country
      if (countryToken) {
        for (const r of results) {
          const addr = r.address || {};
          const addrCountryToken = normalize(addr.country || "");
          const addrCountryCode = (addr.country_code || "").toLowerCase();
          if (addrCountryCode === countryCodeHint || addrCountryToken.includes(countryToken)) {
            return { latitude: parseFloat(r.lat), longitude: parseFloat(r.lon) };
          }
        }
        // No matching-country result in this attempt — try next attempt
        continue;
      }

      // No country hint: return the first result
      const first = results[0];
      return { latitude: parseFloat(first.lat), longitude: parseFloat(first.lon) };
    }

    throw new Error("Location not found");
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};
