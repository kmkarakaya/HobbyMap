import React from "react";
import { useFirebase } from "../contexts/FirebaseContext";
import EntryForm from "../components/EntryForm";

const AddEntryPage = () => {
  const { createEntry } = useFirebase();

  const handleSubmit = async (formData) => {
    // Ensure date is a Date object and payload contains place/country (MVP)
    const payload = { ...formData };
    if (payload.date && typeof payload.date === "string") {
      payload.date = new Date(payload.date);
    }
    // Do not include combined `location` in MVP
  await createEntry(payload);
    // Navigation is handled by DiveSiteForm after showing success message
  };

  return (
    <div>
      <EntryForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default AddEntryPage;
