// Entry Firebase Service (moved from legacy firebase service)
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
// Import directly from the root firebase.js file to ensure we're using the correct config
import { db, auth } from "../firebase";
import { geocodeLocation } from "./geocoder";

// For debugging - log the db object
console.log("Firebase db object:", db);

// Use the new canonical collection name for entries. No backward compatibility
// is required per project scope — we'll store entries under `entries`.
const COLLECTION_NAME = "entries";
const entriesCollection = collection(db, COLLECTION_NAME);

/**
 * Get all entries
 * @returns {Promise<Array>} List of entries
 */
export const getEntries = async (userId = null) => {
  try {
    if (!userId) {
      throw new Error('getEntries requires a userId to scope results to the current user');
    }
  console.log("Starting to fetch entries...");
  console.log("Collection reference:", entriesCollection);
    console.log("DB reference:", db);

    // Now try with query. Prefer ordering by 'date' but gracefully fall back if
    // an index/ordering prevents results from being returned (common in dev).
    let querySnapshot = null;
    try {
      const q = query(
        entriesCollection,
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      console.log("Query with orderBy('date') created, executing...");
      querySnapshot = await getDocs(q);
      console.log(
        "Ordered query successful, processing",
        querySnapshot.size,
        "documents"
      );
    } catch (orderedQueryError) {
      // If ordering or index causes a failure (or returns no documents), try a
      // simpler query without orderBy. This avoids an empty-looking UI when
      // the underlying writes are present.
      console.warn(
        "Ordered query failed or is unsupported, falling back to un-ordered query:",
        orderedQueryError
      );
      try {
  const fallbackQ = query(entriesCollection, where("userId", "==", userId));
        console.log("Executing fallback query without orderBy...");
        querySnapshot = await getDocs(fallbackQ);
        console.log(
          "Fallback query successful, processing",
          querySnapshot.size,
          "documents"
        );
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        throw fallbackError;
      }
    }

  const entries = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        console.log(`Processing document ${doc.id}:`, data);

        // Safely convert date or use a fallback
        let processedDate = null;
        if (data.date) {
          try {
            processedDate = data.date.toDate ? data.date.toDate() : data.date;
            console.log(`Converted date for ${doc.id}:`, processedDate);
          } catch (dateError) {
            console.warn(
              `Date conversion error for document ${doc.id}:`,
              dateError
            );
            // Use the original value or a fallback
            processedDate = data.date;
          }
        }

        // Normalize legacy coordinate fields (some old docs use `lat`/`lng`)
        // into the canonical `latitude` / `longitude` shape used by the map.
        const normalized = { ...data };
        // Prefer explicit `latitude`/`longitude`, then fall back to `lat`/`lng`.
        if ((normalized.latitude === undefined || normalized.latitude === null) && (normalized.lat !== undefined && normalized.lat !== null)) {
          // parseFloat to ensure numeric type when stored as strings
          const latVal = parseFloat(normalized.lat);
          if (!Number.isNaN(latVal)) normalized.latitude = latVal;
        }
        if ((normalized.longitude === undefined || normalized.longitude === null) && (normalized.lng !== undefined && normalized.lng !== null)) {
          const lngVal = parseFloat(normalized.lng);
          if (!Number.isNaN(lngVal)) normalized.longitude = lngVal;
        }

        // Also support nested `location`/`coords` objects if present
        if ((normalized.latitude === undefined || normalized.latitude === null) && normalized.location && (normalized.location.lat || normalized.location.latitude)) {
          const latVal = parseFloat(normalized.location.lat || normalized.location.latitude);
          if (!Number.isNaN(latVal)) normalized.latitude = latVal;
        }
        if ((normalized.longitude === undefined || normalized.longitude === null) && normalized.location && (normalized.location.lng || normalized.location.longitude)) {
          const lngVal = parseFloat(normalized.location.lng || normalized.location.longitude);
          if (!Number.isNaN(lngVal)) normalized.longitude = lngVal;
        }

        // Add to our array with safe date handling and normalized coords
        entries.push({ id: doc.id, ...normalized, date: processedDate });
      } catch (docError) {
        console.error(`Error processing document ${doc.id}:`, docError);
        // Continue processing other documents
      }
    });

    console.log("Successfully processed all documents, returning:", entries);
    return entries;
    } catch (error) {
  console.error("Error getting entries:", error);
    console.error("Error stack:", error.stack);
    // Helpful developer debugging: if the query returned zero results but the
    // collection has documents, surface that fact in the thrown error message.
    throw new Error(`Failed to load entries: ${error.message}`);
  }
};

/**
 * Get a single entry by ID
 * @param {string} id - entry document ID
 * @returns {Promise<Object>} entry data
 */
export const getEntry = async (id) => {
  try {
  const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: data.date?.toDate(),
      };
    } else {
  throw new Error("Entry not found");
    }
  } catch (error) {
    console.error("Error getting entry:", error);
    throw error;
  }
};

/**
 * Create a new entry
 * @param {Object} entryData - entry data
 * @returns {Promise<Object>} Created entry with ID
 */
export const createEntry = async (entryData) => {
  try {
    // Require userId to be present for MVP per-user scoping. If caller didn't
    // include it, try to use the currently authenticated user (best-effort).
    if (!entryData) throw new Error('createEntry requires entryData to be provided');
    const currentUid = auth && auth.currentUser ? auth.currentUser.uid : null;
    if (!entryData.userId && currentUid) {
      entryData.userId = currentUid;
    }
    // Ensure ownerId is present for security rules
    if (!entryData.ownerId && entryData.userId) {
      entryData.ownerId = entryData.userId;
    }
    if (!entryData.userId) {
      throw new Error('createEntry requires entryData.userId to be set (current user)');
    }
  // Debug: Log the data we received
  console.log("Creating entry with data:", entryData);

    // First geocode the location if not already geocoded
    let newEntry = { ...entryData };

    // Convert string date to Firestore timestamp or Date object
    if (newEntry.date && typeof newEntry.date === "string") {
      // Convert to Date object first
      newEntry.date = new Date(newEntry.date);
      console.log("Converted date to Date object:", newEntry.date);
    }

    if (!newEntry.latitude || !newEntry.longitude) {
      try {
        // Use place and country for geocoding (MVP)
        const place = newEntry.place || null;
        const country = newEntry.country || null;
        console.log("Attempting to geocode with:", { place, country });
        const geoData = await geocodeLocation(place, country);
        if (geoData) {
          newEntry.latitude = geoData.latitude;
          newEntry.longitude = geoData.longitude;
          console.log("Geocoding successful:", geoData);
        }
      } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError);
        // Continue with the original data if geocoding fails
      }
    }

    // Ensure ownerId is present for rules that check it
    if (!newEntry.ownerId && newEntry.userId) {
      newEntry.ownerId = newEntry.userId;
    }

    // Add server timestamp
    newEntry.createdAt = serverTimestamp();
    console.log("Final entry data to save:", newEntry);

  const docRef = await addDoc(entriesCollection, newEntry);
  console.log("Document written with ID:", docRef.id);

    // Get the newly created document to return it with the ID
    const newDoc = await getDoc(docRef);
    const data = newDoc.data();
    console.log("Retrieved new document data:", data);

    // Create the return object with proper handling of date
    const returnData = { id: docRef.id, ...data, date: data.date?.toDate ? data.date.toDate() : data.date };
    console.log("Returning data:", returnData);
    return returnData;
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

/**
 * Update an existing entry
 * @param {string} id - entry document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated entry data
 */
export const updateEntry = async (id, updateData) => {
  try {
    // Require userId in update payload for MVP
    if (!updateData || !updateData.userId) {
      throw new Error('updateEntry requires updateData.userId to be set (current user)');
    }
  const docRef = doc(db, COLLECTION_NAME, id);

  // First get the existing entry to check if location has changed
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      throw new Error("Entry not found");
    }

    const existingData = existingDoc.data();
  console.log("Existing entry data:", existingData);

    let dataToUpdate = { ...updateData };

  // Compare place/country for change detection
  const userPlace = updateData.place;
  const userCountry = updateData.country;
  const existingPlace = existingData.place;
  const existingCountry = existingData.country;
  const locationHasChanged = userPlace !== existingPlace || userCountry !== existingCountry;

    console.log("Place/country comparison:", {
      userPlace,
      existingPlace,
      hasChanged: locationHasChanged,
    });

    // Debug logging
  console.log("Update data received:", updateData);
    console.log(
      "Date type:",
      updateData.date instanceof Date ? "Date object" : typeof updateData.date
    );

    // Ensure date is properly handled for Firestore
    if (updateData.date && updateData.date instanceof Date) {
      // Keep Date object for Firestore
      console.log("Date is already a Date object:", updateData.date);
    } else if (updateData.date && typeof updateData.date === "string") {
      // Convert string to Date object
      dataToUpdate.date = new Date(updateData.date);
      console.log("Converted string date to Date object:", dataToUpdate.date);
    }

    // Always geocode if the place/country has changed
    if (locationHasChanged) {
      try {
        const place = dataToUpdate.place || existingData.place;
        const country = dataToUpdate.country || existingData.country;
        console.log("Place/country changed, geocoding new location:", { place, country });
        const geoData = await geocodeLocation(place, country);
        if (geoData) {
          dataToUpdate.latitude = geoData.latitude;
          dataToUpdate.longitude = geoData.longitude;
          console.log("New geocoded coordinates:", geoData);
        }
      } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError);
        // Continue with the original data if geocoding fails
      }
    }

    // Add update timestamp
    dataToUpdate.updatedAt = serverTimestamp();
    console.log("Final data to update:", dataToUpdate);

  await updateDoc(docRef, dataToUpdate);
    console.log("Document updated successfully");

    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();
    console.log("Retrieved updated document data:", data);

    // Create return object with proper date handling
    const returnData = {
      id: updatedDoc.id,
      ...data,
      // Handle date conversion - if it's a Firestore timestamp, convert to Date
      date: data.date?.toDate ? data.date.toDate() : data.date,
    };

    console.log("Returning data:", returnData);
    return returnData;
  } catch (error) {
    console.error("Error updating entry:", error, error.stack);
    throw error;
  }
};

/**
 * Delete an entry
 * @param {string} id - entry document ID
 * @returns {Promise<void>}
 */
export const deleteEntry = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    // Fetch the document first to log ownership info for debugging
    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log(`deleteEntry: fetched document ${id} before delete:`, data);
      } else {
        console.warn(`deleteEntry: document ${id} does not exist before delete`);
      }
    } catch (fetchErr) {
      console.warn(`deleteEntry: failed to fetch document ${id} before delete:`, fetchErr);
    }

    // Log currently authenticated user for correlation with security rules
    const currentUid = auth && auth.currentUser ? auth.currentUser.uid : null;
    console.log("deleteEntry: current auth uid:", currentUid);

    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting entry:", error);
    // Try to provide additional context when permission is denied
    try {
      const snapshot = await getDoc(doc(db, COLLECTION_NAME, id));
      if (snapshot.exists()) {
        console.error(`deleteEntry: document ${id} still exists after failed delete, data:`, snapshot.data());
      } else {
        console.error(`deleteEntry: document ${id} not found after failed delete`);
      }
    } catch (ctxErr) {
      console.warn(`deleteEntry: unable to fetch document ${id} after failed delete:`, ctxErr);
    }
    throw error;
  }
};
