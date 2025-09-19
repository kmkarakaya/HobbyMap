import React from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import DiveSiteForm from "../components/DiveSiteForm";

const AddDiveSitePage = () => {
  const navigate = useNavigate();
  const { createDiveSite } = useFirebase();

  const handleSubmit = async (formData) => {
    await createDiveSite(formData);
    navigate("/dives");
  };

  return (
    <div>
      <DiveSiteForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default AddDiveSitePage;
