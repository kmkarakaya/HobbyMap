// Frontend entries service (browser) — uses the app Firestore instance from ./firebase
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
} from 'firebase/firestore';
import { db } from './firebase';
import { geocodeLocation } from './geocoder';

const COLLECTION_NAME = 'entries';

// helper removed: avoid creating an unused binding that triggers eslint no-unused-vars

export const getEntries = async (userId = null) => {
	try {
		let q;
		const col = collection(db, COLLECTION_NAME);
		if (userId) {
			// Avoid ordering on the server when also filtering by a different field
			// (Firestore requires a composite index for queries that filter and
			// order on different fields). Instead, request the filtered set and
			// sort client-side by date to preserve expected ordering without
			// requiring a composite index.
			q = query(col, where('userId', '==', userId));
		} else {
			q = query(col, orderBy('date', 'desc'));
		}

		const querySnapshot = await getDocs(q);
		const entries = querySnapshot.docs.map((d) => ({
			id: d.id,
			...d.data(),
			date: d.data().date?.toDate && typeof d.data().date.toDate === 'function' ? d.data().date.toDate() : d.data().date,
		}));

		// If we filtered by userId above, Firestore didn't order by date. Sort
		// client-side to preserve the expected descending date ordering.
		if (userId && entries && entries.length > 1) {
			const getTime = (item) => {
				if (!item || item.date == null) return 0;
				if (item.date instanceof Date) return item.date.getTime();
				const parsed = Date.parse(item.date);
				return Number.isFinite(parsed) ? parsed : 0;
			};
			entries.sort((a, b) => getTime(b) - getTime(a));
		}
		return entries;
	} catch (err) {
		console.error('Error getting entries:', err);
		throw err;
	}
};

export const getEntry = async (id) => {
	try {
		const docRef = doc(db, COLLECTION_NAME, id);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) throw new Error('Entry not found');
		const data = docSnap.data();
		return { id: docSnap.id, ...data, date: data.date?.toDate ? data.date.toDate() : data.date };
	} catch (err) {
		console.error(`Error getting entry ${id}:`, err);
		throw err;
	}
};

export const createEntry = async (entryData) => {
	try {
		const place = entryData.place || null;
		const country = entryData.country || null;
		if (place || country) {
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

		if (typeof entryData.date === 'string') entryData.date = new Date(entryData.date);

		const dataToSave = { ...entryData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
		const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
		return { id: docRef.id, ...entryData };
	} catch (err) {
		console.error('Error creating entry:', err);
		throw err;
	}
};

export const updateEntry = async (id, entryData) => {
	try {
		const docRef = doc(db, COLLECTION_NAME, id);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) throw new Error('Entry not found');

		const place = entryData.place || null;
		const country = entryData.country || null;
		if (place || country) {
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

		if (typeof entryData.date === 'string') entryData.date = new Date(entryData.date);

		const dataToUpdate = { ...entryData, updatedAt: serverTimestamp() };
		await updateDoc(docRef, dataToUpdate);
		return { id, ...entryData };
	} catch (err) {
		console.error(`Error updating entry ${id}:`, err);
		throw err;
	}
};

export const deleteEntry = async (id) => {
	try {
		const docRef = doc(db, COLLECTION_NAME, id);
		await deleteDoc(docRef);
	} catch (err) {
		console.error(`Error deleting entry ${id}:`, err);
		throw err;
	}
};

const entriesService = {
	getEntries,
	getEntry,
	createEntry,
	updateEntry,
	deleteEntry,
};

export default entriesService;
