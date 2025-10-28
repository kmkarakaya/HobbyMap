import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import EntryForm from "../components/EntryForm";

const EditEntryPage = () => {
  const { id } = useParams();
  const { getEntry, updateEntry, entries } = useFirebase();
  const [entry, setEntry] = useState(null);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchDiveSite = async () => {
      try {
        const data = await getEntry(id);
          setEntry(data);
      } catch (err) {
        console.error("Error fetching entry:", err);
        setErrorMessage("Failed to load entry. Please try again.");
      } finally {
        setLoadingEntry(false);
      }
    };

    fetchDiveSite();
  }, [id, getEntry, entries]);

  const handleSubmit = async (formData) => {
    try {
      console.log("Submitting updated form data:", formData);
  console.log("Original entry data:", entry);

      // Check if location has been changed
      // Compare place/country to detect change
      const newPlace = formData.place || "";
      const newCountry = formData.country || "";
      const locationChanged = (entry.place || "") !== newPlace || (entry.country || "") !== newCountry;
      console.log(
        "Location changed:",
        locationChanged,
        "Original:",
        { place: entry.place, country: entry.country },
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
      }

      console.log("Data being sent to update:", dataToUpdate);
  await updateEntry(id, dataToUpdate);
      // Navigation is handled by DiveSiteForm after showing success message
    } catch (err) {
      console.error("Error updating entry:", err);
      setErrorMessage("Failed to update entry. Please try again.");
    }
  };

      if (loadingEntry)
    return <div className="loading">Loading entry...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;
  if (!entry) return <div className="error">Entry not found.</div>;

  return (
    <div className="edit-dive-site-page">
  <h1>Edit Entry</h1>
      <EntryForm
        initialData={entry}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  );
};

export default EditEntryPage;
