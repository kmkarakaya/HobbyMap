import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import DiveSiteForm from "../components/DiveSiteForm";

const EditDiveSitePage = () => {
  const { id } = useParams();
  const { getDiveSite, updateDiveSite, diveSites } = useFirebase();
  const [diveSite, setDiveSite] = useState(null);
  const [loadingDiveSite, setLoadingDiveSite] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchDiveSite = async () => {
      try {
        const data = await getDiveSite(id);
        setDiveSite(data);
      } catch (err) {
        console.error("Error fetching entry:", err);
        setErrorMessage("Failed to load entry. Please try again.");
      } finally {
        setLoadingDiveSite(false);
      }
    };

    fetchDiveSite();
  }, [id, getDiveSite, diveSites]);

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting updated form data:", formData);
  console.log("Original entry data:", diveSite);

      // Check if location has been changed
      // Compare place/country to detect change
      const newPlace = formData.place || "";
      const newCountry = formData.country || "";
      const locationChanged = (diveSite.place || "") !== newPlace || (diveSite.country || "") !== newCountry;
      console.log(
        "Location changed:",
        locationChanged,
        "Original:",
        { place: diveSite.place, country: diveSite.country },
        "New:",
        { place: newPlace, country: newCountry }
      );

      // Convert the string date to a JavaScript Date object
      const dateObject = formData.date ? new Date(formData.date) : null;

      const dataToUpdate = {
        title: formData.title || formData.siteName,
        hobby: formData.hobby,
        place: formData.place,
        country: formData.country,
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
      // Navigation is handled by DiveSiteForm after showing success message
    } catch (err) {
      console.error("Error updating entry:", err);
      setErrorMessage("Failed to update entry. Please try again.");
    }
  };

  if (loadingDiveSite)
    return <div className="loading">Loading entry...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;
  if (!diveSite) return <div className="error">Entry not found.</div>;

  return (
    <div className="edit-dive-site-page">
  <h1>Edit Entry</h1>
      <DiveSiteForm
        initialData={diveSite}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  );
};

export default EditDiveSitePage;
