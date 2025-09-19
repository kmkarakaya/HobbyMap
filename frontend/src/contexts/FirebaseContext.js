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

  // Load all dive sites on component mount
  useEffect(() => {
    const loadDiveSites = async () => {
      try {
        setLoading(true);
        const sites = await fetchDiveSites();
        setDiveSites(sites);
        setError(null);
      } catch (err) {
        console.error("Error loading dive sites:", err);
        setError("Failed to load dive sites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDiveSites();
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
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
