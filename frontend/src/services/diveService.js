import axios from "axios";

const API_URL = "http://localhost:5000/api/dives";

// Get all dive sites
export const getDiveSites = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching dive sites:", error);
    throw error;
  }
};

// Get a single dive site
export const getDiveSite = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dive site ${id}:`, error);
    throw error;
  }
};

// Create a new dive site
export const createDiveSite = async (diveSiteData) => {
  try {
    const response = await axios.post(API_URL, diveSiteData);
    return response.data;
  } catch (error) {
    console.error("Error creating dive site:", error);
    throw error;
  }
};

// Update a dive site
export const updateDiveSite = async (id, diveSiteData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, diveSiteData);
    return response.data;
  } catch (error) {
    console.error(`Error updating dive site ${id}:`, error);
    throw error;
  }
};

// Delete a dive site
export const deleteDiveSite = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting dive site ${id}:`, error);
    throw error;
  }
};
