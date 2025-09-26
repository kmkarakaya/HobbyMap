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
    const fetchEntry = async () => {
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

    fetchEntry();
  }, [id, getEntry, entries]);

  const handleSubmit = async (formData) => {
    try {
      const dateObject = formData.date ? new Date(formData.date) : null;

      const dataToUpdate = {
        title: formData.title || formData.siteName,
        hobby: formData.hobby,
        place: formData.place,
        country: formData.country,
        date: dateObject,
        notes: formData.notes,
      };

      await updateEntry(id, dataToUpdate);
    } catch (err) {
      console.error("Error updating entry:", err);
      setErrorMessage("Failed to update entry. Please try again.");
    }
  };

  if (loadingEntry) return <div className="loading">Loading entry...</div>;
  if (errorMessage) return <div className="error">{errorMessage}</div>;
  if (!entry) return <div className="error">Entry not found.</div>;

  return (
    <div className="edit-entry-page">
      <h1>Edit Entry</h1>
      <EntryForm initialData={entry} onSubmit={handleSubmit} isEditing={true} />
    </div>
  );
};

export default EditEntryPage;
