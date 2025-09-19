import React, { createContext, useContext, useState, useEffect } from "react";
// Import db directly from the root firebase.js file which has the correct config
import { db } from "../firebase";
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

  // Load all dive sites on component mount
  useEffect(() => {
    let isMounted = true;

    const loadDiveSites = async () => {
      try {
        console.log("FirebaseContext: Starting to load dive sites...");
        setLoading(true);
        setError(null); // Clear any previous errors

        const sites = await fetchDiveSites();

        if (isMounted) {
          console.log(
            "FirebaseContext: Dive sites loaded successfully:",
            sites
          );
          setDiveSites(sites);
          setError(null);
        }
      } catch (err) {
        console.error("FirebaseContext: Error loading dive sites:", err);
        console.error("Error details:", err.message);
        console.error("Error stack:", err.stack);

        if (isMounted) {
          setError("Failed to load dive sites. Please try again.");
          // Even if there's an error, we'll still try to use any cached sites
          console.log("FirebaseContext: Using cached dive sites (state may be stale)");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

  loadDiveSites();

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
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
      const newSite = await addDiveSite(diveSiteData);

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

  // Clear any error
  const clearError = () => setError(null);

  // Values provided to consumers of this context
  const value = {
    db,
    diveSites,
    loading,
    error,
    getDiveSite,
    createDiveSite,
    updateDiveSite,
    deleteDiveSite,
    clearError,
    retryLoadDiveSites, // Add the retry function
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
