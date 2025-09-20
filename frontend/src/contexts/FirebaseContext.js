import React, { createContext, useContext, useState, useEffect } from "react";
// Import db directly from the root firebase.js file which has the correct config
import { db, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
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

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;
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
      // Attach current user's UID if available
      const payload = { ...diveSiteData };
      if (user && user.uid) payload.userId = user.uid;
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
      const updatedSite = await editDiveSite(id, diveSiteData);

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
    signOut,
    clearError,
    retryLoadDiveSites, // Add the retry function
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
