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
} from "../firebase/diveService";

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
      setError("Failed to load entries. Please try again.");
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
          setError("Failed to load entries. Please try again.");
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

  // Get a single dive site by ID
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

  // Create a new dive site
  const createEntry = async (entryData) => {
    try {
      setLoading(true);
      // Ensure a user is signed in for MVP (require userId)
      if (!user || !user.uid) throw new Error('Must be signed in to create a dive site');
      // Include both userId (per-entry owner) and ownerId for compatibility with
      // diveSites-backed storage so Firestore rules that require ownerId pass.
      const payload = { ...entryData, userId: user.uid, ownerId: user.uid };
      const newSite = await addEntry(payload);

      // After creating the site, re-fetch the authoritative list from
      // Firestore to ensure server-side fields (timestamps) and indexes are
      // applied and to avoid visibility issues on subsequent sign-in.
      try {
        const refreshed = await fetchEntries(user.uid);
        setEntries(refreshed);
      } catch (refreshErr) {
        // If refresh fails for any reason, fall back to optimistic update
        console.warn("Failed to refresh dive sites after create:", refreshErr);
        setEntries((prevSites) => [newSite, ...prevSites]);
      }

      return newSite;
    } catch (err) {
      setError("Failed to create entry. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing dive site
  const updateEntry = async (id, entryData) => {
    try {
      setLoading(true);
      // For MVP, ensure user is present and include userId to protect writes
      if (!user || !user.uid) throw new Error('Must be signed in to update an entry');
      // Include ownerId as well for write permission checks on diveSites collection
      const payload = { ...entryData, userId: user.uid, ownerId: user.uid };
      const updatedSite = await editEntry(id, payload);

      // Update the local state with the updated dive site
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

  // Delete a dive site
  const deleteEntry = async (id) => {
    try {
      setLoading(true);
      await removeEntry(id);

      // Remove the dive site from local state
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
