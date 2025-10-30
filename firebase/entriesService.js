// Entries Firebase Service (server-side/shared helper for scripts)
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
import { db } from "./firebase";
// Note: geocoder is required lazily inside functions to allow test-time mocking
// of the geocoder module (some test runners don't transform repo-root files the
// same way as src/, so importing at module top-level can prevent mocks from
// being applied). We require it inside functions below.

const COLLECTION_NAME = "entries";
const entriesCollection = collection(db, COLLECTION_NAME);

export const getEntries = async (userId = null) => {
  try {
    // If a userId is provided, scope results to that user to match Firestore rules.
    let q;
    if (userId) {
      q = query(entriesCollection, where("userId", "==", userId), orderBy("date", "desc"));
    } else {
      // If no userId provided, return all entries ordered by date (admin/scripts usage)
      q = query(entriesCollection, orderBy("date", "desc"));
    }

    const querySnapshot = await getDocs(q);

    const entries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate && typeof doc.data().date.toDate === 'function' ? doc.data().date.toDate() : doc.data().date,
    }));

    return entries;
  } catch (error) {
    console.error("Error getting entries:", error);
    throw error;
  }
};

export const getEntry = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Entry not found");
    }

    const data = docSnap.data();
    return { id: docSnap.id, ...data, date: data.date?.toDate() };
  } catch (error) {
    console.error(`Error getting entry ${id}:`, error);
    throw error;
  }
};

export const createEntry = async (entryData) => {
  try {
    const place = entryData.place || null;
    const country = entryData.country || null;
    if (place || country) {
      // require geocoder lazily so tests can mock the module before this code runs
      const { geocodeLocation } = require('./geocoder');
      let coordinates;
      try {
        coordinates = await geocodeLocation(place, country);
      } catch (err) {
        // Normalize geocoding errors to a descriptive message for callers/tests
        throw new Error(`Geocoding failed: ${err && err.message ? err.message : err}`);
      }

      const lat = Number(coordinates && coordinates.latitude);
      const lon = Number(coordinates && coordinates.longitude);
      if (!isFinite(lat) || !isFinite(lon)) {
        throw new Error('Geocoding failed: coordinates not found');
      }

      entryData.latitude = lat;
      entryData.longitude = lon;
    }

    if (typeof entryData.date === "string") {
      entryData.date = new Date(entryData.date);
    }

    const dataToSave = {
      ...entryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(entriesCollection, dataToSave);

    return { id: docRef.id, ...entryData };
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

export const updateEntry = async (id, entryData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Entry not found");
    }

    const place = entryData.place || null;
    const country = entryData.country || null;
    if (place || country) {
      // require geocoder lazily so tests can mock the module before this code runs
      const { geocodeLocation } = require('./geocoder');
      let coordinates;
      try {
        coordinates = await geocodeLocation(place, country);
      } catch (err) {
        throw new Error(`Geocoding failed: ${err && err.message ? err.message : err}`);
      }

      const lat = Number(coordinates && coordinates.latitude);
      const lon = Number(coordinates && coordinates.longitude);
      if (!isFinite(lat) || !isFinite(lon)) {
        throw new Error('Geocoding failed: coordinates not found');
      }

      entryData.latitude = lat;
      entryData.longitude = lon;
    }

    if (typeof entryData.date === "string") {
      entryData.date = new Date(entryData.date);
    }

    const dataToUpdate = { ...entryData, updatedAt: serverTimestamp() };
    await updateDoc(docRef, dataToUpdate);

    return { id, ...entryData };
  } catch (error) {
    console.error(`Error updating entry ${id}:`, error);
    throw error;
  }
};

export const deleteEntry = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting entry ${id}:`, error);
    throw error;
  }
};
