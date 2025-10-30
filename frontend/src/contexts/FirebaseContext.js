import React, { createContext, useContext, useState, useEffect } from "react";
// Import db directly from the root firebase.js file which has the correct config
import { db, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getEntries as fetchEntries,
  getEntry as fetchEntry,
  createEntry as addEntry,
  updateEntry as editEntry,
  deleteEntry as removeEntry,
} from "../firebase/entriesService";

// Debug log to verify the db being used
console.log("FirebaseContext using db:", db);

// Create context
const FirebaseContext = createContext(null);

// Custom hook to use the firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track whether we've received the initial auth state from Firebase
  // This prevents a flash of unauthenticated UI while the SDK initializes
  const [authInitializing, setAuthInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Function to manually retry loading entries
  const retryLoadEntries = async () => {
    try {
      console.log("FirebaseContext: Manually retrying loading entries...");
      setLoading(true);
      setError(null);
      if (!user || !user.uid) {
        throw new Error('Must be signed in to load entries');
      }
      const sites = await fetchEntries(user.uid);

        console.log("FirebaseContext: Retry successful, entries loaded:", sites);
      setEntries(sites);
      setError(null);
    } catch (err) {
        console.error("FirebaseContext: Retry failed:", err);
        // Surface Firebase error code/message if available to aid diagnosis
        const code = err && err.code ? ` (${err.code})` : '';
        const msg = err && err.message ? `${err.message}${code}` : `Failed to load entries.${code}`;
        // If permission denied, provide a friendlier hint for migration/ownership issues
        if (err && err.code === 'permission-denied') {
          setError('Failed to load entries: permission denied. Ensure your entries documents include a matching userId or your user has access.');
        } else {
          setError(msg || 'Failed to load entries. Please try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to auth state and load user's entries
  useEffect(() => {
    let isMounted = true;
    // Use a ref-like flag to ensure we only flip authInitializing once without adding it as a dependency
    let initialized = false;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;
      // Mark that we've received the first auth state from Firebase
      if (!initialized) {
        setAuthInitializing(false);
        initialized = true;
      }

      setUser(u);
        if (u) {
        // User logged in - load user's entries
        try {
          setLoading(true);
          const sites = await fetchEntries(u.uid);
          setEntries(sites);
          setError(null);
        } catch (err) {
          console.error("FirebaseContext: Error loading user's entries:", err);
          if (err && err.code === 'permission-denied') {
            setError('Failed to load entries: permission denied. Your stored entries may be missing the `userId` field or rules prevent access.');
          } else {
            const code = err && err.code ? ` (${err.code})` : '';
            const msg = err && err.message ? `${err.message}${code}` : 'Failed to load entries. Please try again.';
            setError(msg);
          }
        } finally {
          setLoading(false);
        }
        } else {
        // User logged out - clear entries
        setEntries([]);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Get a single entry by ID
  const getEntry = async (id) => {
    try {
      setLoading(true);
      const site = await fetchEntry(id);
      return site;
    } catch (err) {
      setError("Failed to load entry details.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new entry
  // Simple counter to help detect duplicate/overlapping create calls in logs
  let createCounter = 0;

  const createEntry = async (entryData) => {
    try {
      setLoading(true);
      // Ensure a user is signed in for MVP (require userId)
  if (!user || !user.uid) throw new Error('Must be signed in to create an entry');
      // Debug: log current auth user and incoming payload to help diagnose
      // permission issues observed in the wild.
      console.log('createEntry: current user', user);
      console.log('createEntry: incoming entryData', entryData);
      // Log whether coords are present (use console.log so it's visible by default)
      console.log('createEntry: has explicit coords ->', {
        hasLatitude: !!(entryData && (entryData.latitude !== undefined && entryData.latitude !== null)),
        hasLongitude: !!(entryData && (entryData.longitude !== undefined && entryData.longitude !== null)),
      });
      // Extra instrumentation to trace the create flow and understand why
      // some environments report a failure even when a write succeeded.
  const callId = ++createCounter;
  console.log(`createEntry[#${callId}]: starting addEntry call...`);
      // Include both userId (per-entry owner) and ownerId for compatibility with
  // entries-backed storage so Firestore rules that require ownerId pass.
      const payload = { ...entryData, userId: user.uid, ownerId: user.uid };
      // Keep track of previous entries count so we can attempt recovery if
      // addEntry throws but the server write actually succeeded
      const prevCount = entries ? entries.length : 0;
      let newSite = null;
      try {
        newSite = await addEntry(payload);
        console.log(`createEntry[#${callId}]: addEntry resolved, newSite:`, newSite);
        // Clear any previous context-level error now that a create has resolved
        setError(null);
      } catch (addErr) {
        console.error(`createEntry[#${callId}]: addEntry threw an error:`, addErr);
        // If it's a geocoding error, propagate so UI can show map picker
        if (addErr && addErr.message && addErr.message.toLowerCase().includes('geocoding failed')) {
          throw addErr;
        }

        // Otherwise, attempt to recover by refreshing entries from backend
        try {
          console.log(`createEntry[#${callId}]: attempting recovery refresh after addEntry error...`);
          const refreshed = await fetchEntries(user.uid);
          console.log(`createEntry[#${callId}]: recovery refresh count:`, refreshed.length);
          if (refreshed.length > prevCount) {
            // We assume the new entry exists on server; update local state
            setEntries(refreshed);
            return refreshed[0] || null;
          }
        } catch (refreshErr) {
          console.warn('createEntry: recovery refresh failed:', refreshErr);
        }

        // If recovery fails, rethrow original error to surface to UI
        throw addErr;
      }

      try {
        console.log(`createEntry[#${callId}]: attempting to refresh entries from backend...`);
        const refreshed = await fetchEntries(user.uid);
        console.log(`createEntry[#${callId}]: refresh successful, count:`, refreshed.length);
        setEntries(refreshed);
        // Clear any previous context-level error now that refresh succeeded
        setError(null);
      } catch (refreshErr) {
        console.warn("Failed to refresh entries after create:", refreshErr);
        if (newSite) {
          setEntries((prevSites) => [newSite, ...prevSites]);
          // If we fall back to optimistic update, clear any previous error
          setError(null);
        }
      }

      return newSite;
    } catch (err) {
      console.error('createEntry: caught error during create flow:', err);
      // If the user provided explicit coordinates, prefer an optimistic
      // update so the user doesn't see a false-negative error when the
      // underlying write may have succeeded but follow-up refresh failed.
      const hasCoords = entryData && (entryData.latitude !== undefined && entryData.longitude !== undefined);
      if (hasCoords) {
        console.warn('createEntry: applying optimistic update due to error but coords present');
        const optimistic = { id: `local-${Date.now()}`, ...entryData };
        setEntries((prev) => [optimistic, ...prev]);
        // Clear any error state since we're applying an optimistic update
        setError(null);
        // Do not throw — return the optimistic object so callers proceed
        return optimistic;
      }

      setError("Failed to create entry. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing entry
  const updateEntry = async (id, entryData) => {
    try {
      setLoading(true);
      // For MVP, ensure user is present and include userId to protect writes
      if (!user || !user.uid) throw new Error('Must be signed in to update an entry');
  // Include ownerId as well for write permission checks on entries collection
      const payload = { ...entryData, userId: user.uid, ownerId: user.uid };
      const updatedSite = await editEntry(id, payload);

      // Update the local state with the updated entry
      setEntries((prevSites) =>
        prevSites.map((site) =>
          site.id === id ? { ...site, ...updatedSite } : site
        )
      );

      return updatedSite;
    } catch (err) {
      setError("Failed to update entry. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry
  const deleteEntry = async (id) => {
    try {
      setLoading(true);
      // Client-side ownership guard: check local state first to avoid
      // making a delete call that will be denied by security rules.
      const site = entries.find((e) => e.id === id);
      const currentUid = user && user.uid ? user.uid : null;

      if (site) {
        const ownerId = site.ownerId || site.userId || null;
        if (!currentUid || !ownerId || ownerId !== currentUid) {
          const msg = 'You do not have permission to delete this entry.';
          setError(msg);
          throw new Error(msg);
        }
      } else {
        // If we don't have the document locally, attempt to fetch it to
        // determine ownership before deleting.
        try {
          const fetched = await fetchEntry(id);
          const ownerId = fetched.ownerId || fetched.userId || null;
          if (!currentUid || !ownerId || ownerId !== currentUid) {
            const msg = 'You do not have permission to delete this entry.';
            setError(msg);
            throw new Error(msg);
          }
        } catch (fetchErr) {
          // If fetching fails, continue and let the delete call surface the
          // permission error from Firestore (we'll log it there).
          console.warn('deleteEntry: could not fetch entry for ownership check:', fetchErr);
        }
      }

      await removeEntry(id);

  // Remove the entry from local state
  setEntries((prevSites) => prevSites.filter((site) => site.id !== id));
    } catch (err) {
      setError("Failed to delete entry. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auth methods
  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      setUser(cred.user);
      return cred.user;
    } catch (err) {
      setError(err.message || "Failed to sign up");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      return cred.user;
    } catch (err) {
      setError(err.message || "Failed to sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      return cred.user;
    } catch (err) {
        // Provide a clearer message for common misconfiguration
        if (err && err.code === 'auth/configuration-not-found') {
          const friendly =
            "Google Sign-In is not configured for this Firebase project. " +
            "Open the Firebase Console -> Authentication -> Sign-in method and enable 'Google', " +
            "and add your app's origin to Authorized domains (e.g. localhost:3000).";
          setError(friendly);
          console.error('Google sign-in configuration missing:', err);
          throw new Error(friendly);
        }

        setError(err.message || "Failed to sign in with Google");
        throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setEntries([]);
    } catch (err) {
      setError(err.message || "Failed to sign out");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear any error
  const clearError = () => setError(null);

  // Values provided to consumers of this context
  const value = {
    db,
    auth,
    user,
    entries,
    loading,
    error,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
    retryLoadEntries, // Add the retry function
    // Expose a simple ready flag so consumers can avoid redirect/flash
    isAuthReady: !authInitializing,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {authInitializing ? (
        // Simple loading state while Firebase determines auth status
        <div style={{padding: 40, textAlign: 'center'}}>Initializing authentication...</div>
      ) : (
        children
      )}
    </FirebaseContext.Provider>
  );
};
