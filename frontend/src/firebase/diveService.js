// Dive Site Firebase Service
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
} from "firebase/firestore";
import { db } from "./firebase";
import { geocodeLocation } from "./geocoder";

const COLLECTION_NAME = "diveSites";
const diveSitesCollection = collection(db, COLLECTION_NAME);

/**
 * Get all dive sites
 * @returns {Promise<Array>} List of dive sites
 */
export const getDiveSites = async () => {
  try {
    const q = query(diveSitesCollection, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    const diveSites = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date for easier handling in UI
      date: doc.data().date?.toDate(),
    }));

    return diveSites;
  } catch (error) {
    console.error("Error getting dive sites:", error);
    throw error;
  }
};

/**
 * Get a single dive site by ID
 * @param {string} id - Dive site document ID
 * @returns {Promise<Object>} Dive site data
 */
export const getDiveSite = async (id) => {
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
      throw new Error("Dive site not found");
    }
  } catch (error) {
    console.error("Error getting dive site:", error);
    throw error;
  }
};

/**
 * Create a new dive site
 * @param {Object} diveSiteData - Dive site data
 * @returns {Promise<Object>} Created dive site with ID
 */
export const createDiveSite = async (diveSiteData) => {
  try {
    // First geocode the location if not already geocoded
    let newDiveSite = { ...diveSiteData };

    if (!newDiveSite.latitude || !newDiveSite.longitude) {
      try {
        const geoData = await geocodeLocation(newDiveSite.location);
        if (geoData) {
          newDiveSite.latitude = geoData.latitude;
          newDiveSite.longitude = geoData.longitude;
        }
      } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError);
        // Continue with the original data if geocoding fails
      }
    }

    // Add server timestamp
    newDiveSite.createdAt = serverTimestamp();

    const docRef = await addDoc(diveSitesCollection, newDiveSite);

    // Get the newly created document to return it with the ID
    const newDoc = await getDoc(docRef);
    const data = newDoc.data();

    return {
      id: docRef.id,
      ...data,
      date: data.date?.toDate(),
    };
  } catch (error) {
    console.error("Error creating dive site:", error);
    throw error;
  }
};

/**
 * Update an existing dive site
 * @param {string} id - Dive site document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated dive site data
 */
export const updateDiveSite = async (id, updateData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);

    // First geocode the location if it has changed and coordinates not provided
    let dataToUpdate = { ...updateData };

    if (
      updateData.location &&
      (!updateData.latitude || !updateData.longitude)
    ) {
      try {
        const geoData = await geocodeLocation(updateData.location);
        if (geoData) {
          dataToUpdate.latitude = geoData.latitude;
          dataToUpdate.longitude = geoData.longitude;
        }
      } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError);
        // Continue with the original data if geocoding fails
      }
    }

    // Add update timestamp
    dataToUpdate.updatedAt = serverTimestamp();

    await updateDoc(docRef, dataToUpdate);

    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();

    return {
      id: updatedDoc.id,
      ...data,
      date: data.date?.toDate(),
    };
  } catch (error) {
    console.error("Error updating dive site:", error);
    throw error;
  }
};

/**
 * Delete a dive site
 * @param {string} id - Dive site document ID
 * @returns {Promise<void>}
 */
export const deleteDiveSite = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting dive site:", error);
    throw error;
  }
};
