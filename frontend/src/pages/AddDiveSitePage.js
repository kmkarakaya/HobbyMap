import React from "react";
import { useFirebase } from "../contexts/FirebaseContext";
import DiveSiteForm from "../components/DiveSiteForm";

const AddDiveSitePage = () => {
  const { createDiveSite } = useFirebase();

  const handleSubmit = async (formData) => {
    // Ensure date is a Date object and payload contains place/country (MVP)
    const payload = { ...formData };
    if (payload.date && typeof payload.date === "string") {
      payload.date = new Date(payload.date);
    }
    // Do not include combined `location` in MVP
    await createDiveSite(payload);
    // Navigation is handled by DiveSiteForm after showing success message
  };

  return (
    <div>
      <DiveSiteForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default AddDiveSitePage;
