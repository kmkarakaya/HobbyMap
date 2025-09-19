import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import DiveSiteForm from "../components/DiveSiteForm";

const EditDiveSitePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDiveSite, updateDiveSite, loading, error } = useFirebase();
  const [diveSite, setDiveSite] = useState(null);
  const [loadingDiveSite, setLoadingDiveSite] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchDiveSite = async () => {
      try {
        const data = await getDiveSite(id);
        setDiveSite(data);
      } catch (err) {
        console.error("Error fetching dive site:", err);
        setErrorMessage("Failed to load dive site. Please try again.");
      } finally {
        setLoadingDiveSite(false);
      }
    };

    fetchDiveSite();
  }, [id, getDiveSite]);

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting updated form data:", formData);
      console.log("Original dive site data:", diveSite);

      // Check if location has been changed
      const locationChanged = diveSite.location !== formData.location;
      console.log(
        "Location changed:",
        locationChanged,
        "Original:",
        diveSite.location,
        "New:",
        formData.location
      );

      // Convert the string date to a JavaScript Date object
      const dateObject = formData.date ? new Date(formData.date) : null;

      const dataToUpdate = {
        siteName: formData.siteName,
        location: formData.location,
        date: dateObject, // Use Date object instead of string
        notes: formData.notes,
      };

      // If location changed, explicitly set coordinates to null to force re-geocoding
      if (locationChanged) {
        console.log("Location changed, forcing geocoding");
        // We don't need to set these to null anymore since we're checking location change
        // in the service, but keeping the log for clarity
      }

      console.log("Data being sent to update:", dataToUpdate);
      await updateDiveSite(id, dataToUpdate);
      navigate("/dives");
    } catch (err) {
      console.error("Error updating dive site:", err);
      setErrorMessage("Failed to update dive site. Please try again.");
    }
  };

  if (loadingDiveSite)
    return <div className="loading">Loading dive site...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;
  if (!diveSite) return <div className="error">Dive site not found.</div>;

  return (
    <div className="edit-dive-site-page">
      <h1>Edit Dive Site</h1>
      <DiveSiteForm
        initialData={diveSite}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  );
};

export default EditDiveSitePage;
