// DEPRECATED: Legacy DiveSiteForm (duplicate of EntryForm). Kept for
// reference during the rename/migration. Use `frontend/src/components/EntryForm.js`.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../src/contexts/FirebaseContext";
import Select from "react-select";
import "../src/components/EntryForm.css";
import countries from "../src/data/countries";
// Import the test functions
import {
  testFirebaseWrite,
  testFirebaseRead,
} from "../src/firebase/testConnection";

const DiveSiteForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const { createEntry, error: firebaseError, clearError } = useFirebase();

  const [formData, setFormData] = useState({
    title: "",
    hobby: "",
    place: "", // city/town/site
    country: "",
    date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Initialize form data with initialData for editing
  useEffect(() => {
    if (initialData) {
      let formattedDate = "";

      if (initialData.date instanceof Date) {
        formattedDate = initialData.date.toISOString().substring(0, 10);
      } else if (typeof initialData.date === "string") {
        const dateObj = new Date(initialData.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().substring(0, 10);
        } else {
          formattedDate = initialData.date.substring(0, 10);
        }
      } else if (initialData.date && typeof initialData.date.toDate === "function") {
        formattedDate = initialData.date.toDate().toISOString().substring(0, 10);
      }

      setFormData({
        title: initialData.title || initialData.siteName || "",
        hobby: initialData.hobby || "",
        place: initialData.place || "",
        country: initialData.country || "",
        date: formattedDate,
        notes: initialData.notes || "",
      });
    }
  }, []);

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setTestResult("Testing Firebase connection...");

      const writeResult = await testFirebaseWrite();

      if (writeResult.success) {
        const readResult = await testFirebaseRead();
        if (readResult.success) {
          setTestResult("Firebase connection successful! Both read and write operations work.");
        } else {
          setTestResult(`Firebase write worked but read failed: ${readResult.error}`);
        }
      } else {
        setTestResult(`Firebase connection failed: ${writeResult.error}`);
      }
    } catch (err) {
      setTestResult(`Error testing connection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { title, hobby, place, country, date, notes } = formData;

  const handleCountryChange = (selectedOption) => {
    if (error) setError(null);
    if (firebaseError) clearError();

    const countryValue = selectedOption ? selectedOption.value : "";
    setFormData((prevData) => ({ ...prevData, country: countryValue }));
  };

  const onChange = (e) => {
    if (error) setError(null);
    if (firebaseError) clearError();

    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title || !hobby || !place || !country || !date) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, place: formData.place, country: formData.country };

      if (isEditing && onSubmit) {
        await onSubmit(payload);
      } else {
        await createEntry(payload);
      }

      setSuccess(true);
      setTimeout(() => navigate("/entries"), 1500);
    } catch (err) {
      setError(`Error ${isEditing ? "updating" : "creating"} entry: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dive-site-form-container">
      <h2>{isEditing ? "Edit Entry" : "Add New Entry"}</h2>
      {/* Form markup omitted - see EntryForm.js */}
    </div>
  );
};

export default DiveSiteForm;
