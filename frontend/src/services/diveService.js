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
import { db } from "../../firebase/firebase";
import { geocodeLocation } from "../../firebase/geocoder";

const COLLECTION_NAME = "diveSites";
const diveSitesCollection = collection(db, COLLECTION_NAME);

// Get all dive sites
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

    return { data: diveSites };
  } catch (error) {
    console.error("Error fetching dive sites:", error);
    throw error;
  }
};

// Get a single dive site
export const getDiveSite = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Dive site not found");
    }

    const data = docSnap.data();
    return {
      data: {
        id: docSnap.id,
        ...data,
        date: data.date?.toDate(),
      },
    };
  } catch (error) {
    console.error(`Error fetching dive site ${id}:`, error);
    throw error;
  }
};

// Create a new dive site
export const createDiveSite = async (diveSiteData) => {
  try {
    // Get geocoding data if location is provided
    if (diveSiteData.location) {
      const coordinates = await geocodeLocation(diveSiteData.location);
      diveSiteData.latitude = coordinates.latitude;
      diveSiteData.longitude = coordinates.longitude;
    }

    // Convert string date to Date object
    if (typeof diveSiteData.date === "string") {
      diveSiteData.date = new Date(diveSiteData.date);
    }

    // Add timestamps
    const dataToSave = {
      ...diveSiteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(diveSitesCollection, dataToSave);

    // Return the created document with ID
    return {
      data: {
        id: docRef.id,
        ...diveSiteData,
      },
    };
  } catch (error) {
    console.error("Error creating dive site:", error);
    throw error;
  }
};

// Update a dive site
export const updateDiveSite = async (id, diveSiteData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Dive site not found");
    }

    // Get geocoding data if location changed
    if (diveSiteData.location) {
      const coordinates = await geocodeLocation(diveSiteData.location);
      diveSiteData.latitude = coordinates.latitude;
      diveSiteData.longitude = coordinates.longitude;
    }

    // Convert string date to Date object
    if (typeof diveSiteData.date === "string") {
      diveSiteData.date = new Date(diveSiteData.date);
    }

    // Add updated timestamp
    const dataToUpdate = {
      ...diveSiteData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, dataToUpdate);

    return {
      data: {
        id,
        ...diveSiteData,
      },
    };
  } catch (error) {
    console.error(`Error updating dive site ${id}:`, error);
    throw error;
  }
};

// Delete a dive site
export const deleteDiveSite = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting dive site ${id}:`, error);
    throw error;
  }
};
