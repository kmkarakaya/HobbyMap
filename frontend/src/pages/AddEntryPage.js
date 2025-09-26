import React from "react";
import { useFirebase } from "../contexts/FirebaseContext";
import EntryForm from "../components/EntryForm";

const AddEntryPage = () => {
  const { createEntry } = useFirebase();

  const handleSubmit = async (formData) => {
    const payload = { ...formData };
    if (payload.date && typeof payload.date === "string") {
      payload.date = new Date(payload.date);
    }
    await createEntry(payload);
  };

  return (
    <div>
  <EntryForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default AddEntryPage;
