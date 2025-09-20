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
  getDiveSites as fetchDiveSites,
  getDiveSite as fetchDiveSite,
  createDiveSite as addDiveSite,
  updateDiveSite as editDiveSite,
  deleteDiveSite as removeDiveSite,
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
  const [diveSites, setDiveSites] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track whether we've received the initial auth state from Firebase
  // This prevents a flash of unauthenticated UI while the SDK initializes
  const [authInitializing, setAuthInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Function to manually retry loading dive sites
  const retryLoadDiveSites = async () => {
    try {
      console.log("FirebaseContext: Manually retrying loading dive sites...");
      setLoading(true);
      setError(null);

      const sites = await fetchDiveSites();

      console.log("FirebaseContext: Retry successful, sites loaded:", sites);
      setDiveSites(sites);
      setError(null);
    } catch (err) {
      console.error("FirebaseContext: Retry failed:", err);
      setError("Failed to load dive sites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to auth state and load user's dive sites
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
        // User logged in - load user's dive sites
        try {
          setLoading(true);
          const sites = await fetchDiveSites(u.uid);
          setDiveSites(sites);
          setError(null);
        } catch (err) {
          console.error("FirebaseContext: Error loading user's dive sites:", err);
          setError("Failed to load dive sites. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        // User logged out - clear dive sites
        setDiveSites([]);
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
  const getDiveSite = async (id) => {
    try {
      setLoading(true);
      const site = await fetchDiveSite(id);
      return site;
    } catch (err) {
      setError("Failed to load dive site details.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new dive site
  const createDiveSite = async (diveSiteData) => {
    try {
      setLoading(true);
      // Ensure a user is signed in for MVP (require userId)
      if (!user || !user.uid) throw new Error('Must be signed in to create a dive site');
      const payload = { ...diveSiteData, userId: user.uid };
      const newSite = await addDiveSite(payload);

      // Update the local state with the new dive site
      setDiveSites((prevSites) => [newSite, ...prevSites]);

      return newSite;
    } catch (err) {
      setError("Failed to create dive site. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing dive site
  const updateDiveSite = async (id, diveSiteData) => {
    try {
      setLoading(true);
      // For MVP, ensure user is present and include userId to protect writes
      if (!user || !user.uid) throw new Error('Must be signed in to update a dive site');
      const payload = { ...diveSiteData, userId: user.uid };
      const updatedSite = await editDiveSite(id, payload);

      // Update the local state with the updated dive site
      setDiveSites((prevSites) =>
        prevSites.map((site) =>
          site.id === id ? { ...site, ...updatedSite } : site
        )
      );

      return updatedSite;
    } catch (err) {
      setError("Failed to update dive site. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a dive site
  const deleteDiveSite = async (id) => {
    try {
      setLoading(true);
      await removeDiveSite(id);

      // Remove the dive site from local state
      setDiveSites((prevSites) => prevSites.filter((site) => site.id !== id));
    } catch (err) {
      setError("Failed to delete dive site. Please try again.");
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
      setDiveSites([]);
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
    diveSites,
    loading,
    error,
    getDiveSite,
    createDiveSite,
    updateDiveSite,
    deleteDiveSite,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
    retryLoadDiveSites, // Add the retry function
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
