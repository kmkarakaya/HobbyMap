/**
 * Client-side geocoding service using OpenStreetMap Nominatim API
 */

/**
 * Convert a location string to latitude and longitude coordinates
 * @param {string} placeOrLocation - Location name (city, address, etc.)
 * @param {string} country - Optional country to improve results
 * @returns {Promise<{latitude: number|null, longitude: number|null}>} - Coordinates
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
 * Reverse geocode (latitude, longitude) to a human-readable location
 */
export const reverseGeocode = async (latitude, longitude) => {
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
		);
		if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.statusText}`);
		const data = await response.json();

		// Nominatim returns an `address` object with granular fields. Prefer a
		// concise place name (city/town/village or county) and include country and
		// country_code to help the frontend match the country select list.
		const addr = data && data.address ? data.address : {};
		const place = addr.city || addr.town || addr.village || addr.hamlet || addr.county || data.display_name || '';
		const country = addr.country || '';
		const countryCode = addr.country_code ? addr.country_code.toUpperCase() : '';

		return { place, country, countryCode, display_name: data.display_name || '' };
	} catch (err) {
		console.error('Reverse geocoding error:', err);
		return { place: '', country: '', countryCode: '', display_name: '' };
	}
};
