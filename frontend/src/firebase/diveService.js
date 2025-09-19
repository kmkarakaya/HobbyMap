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
// Import directly from the root firebase.js file to ensure we're using the correct config
import { db } from "../firebase";
import { geocodeLocation } from "./geocoder";

// For debugging - log the db object
console.log("Firebase db object:", db);

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
    // Debug: Log the data we received
    console.log("Creating dive site with data:", diveSiteData);

    // First geocode the location if not already geocoded
    let newDiveSite = { ...diveSiteData };

    // Convert string date to Firestore timestamp or Date object
    if (newDiveSite.date && typeof newDiveSite.date === "string") {
      // Convert to Date object first
      newDiveSite.date = new Date(newDiveSite.date);
      console.log("Converted date to Date object:", newDiveSite.date);
    }

    if (!newDiveSite.latitude || !newDiveSite.longitude) {
      try {
        console.log("Attempting to geocode location:", newDiveSite.location);
        const geoData = await geocodeLocation(newDiveSite.location);
        if (geoData) {
          newDiveSite.latitude = geoData.latitude;
          newDiveSite.longitude = geoData.longitude;
          console.log("Geocoding successful:", geoData);
        }
      } catch (geocodeError) {
        console.warn("Geocoding failed:", geocodeError);
        // Continue with the original data if geocoding fails
      }
    }

    // Add server timestamp
    newDiveSite.createdAt = serverTimestamp();
    console.log("Final dive site data to save:", newDiveSite);

    const docRef = await addDoc(diveSitesCollection, newDiveSite);
    console.log("Document written with ID:", docRef.id);

    // Get the newly created document to return it with the ID
    const newDoc = await getDoc(docRef);
    const data = newDoc.data();
    console.log("Retrieved new document data:", data);

    // Create the return object with proper handling of date
    const returnData = {
      id: docRef.id,
      ...data,
      // Handle date conversion - if it's a Firestore timestamp, convert to Date
      date: data.date?.toDate ? data.date.toDate() : data.date,
    };
    console.log("Returning data:", returnData);
    return returnData;
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
