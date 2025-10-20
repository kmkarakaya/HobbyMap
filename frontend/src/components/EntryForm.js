import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import Select from "react-select";
import "./DiveSiteForm.css";
import countries from "../data/countries";
import {
  testFirebaseWrite,
  testFirebaseRead,
} from "../firebase/testConnection";

const EntryForm = ({ initialData = null, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const { createEntry, error: firebaseError, clearError } = useFirebase();

  const [formData, setFormData] = useState({
    title: "",
    hobby: "",
    place: "",
    country: "",
    date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);

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
      } else if (
        initialData.date &&
        typeof initialData.date.toDate === "function"
      ) {
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
  }, [initialData]);

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
      setLoading(false);
      setSuccess(true);
      setTimeout(() => { navigate("/entries"); }, 1500);
    } catch (err) {
      setError(`Error ${isEditing ? "updating" : "creating"} entry: ${err.message || "Please try again."}`);
      setLoading(false);
    }
  };

  return (
    <div className="dive-site-form-container">
      <h2>{isEditing ? "Edit Entry" : "Add New Entry"}</h2>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message" style={{
          padding: "10px",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          color: "#155724",
          marginBottom: "15px"
        }}>
          ✅ Entry {isEditing ? "updated" : "saved"} successfully! Redirecting to your entries...
        </div>
      )}
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            placeholder="Enter a short title for this entry (e.g. Concert at Madison Square Garden)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hobby">Hobby / Activity*</label>
          <input
            type="text"
            id="hobby"
            name="hobby"
            value={hobby}
            onChange={onChange}
            required
            placeholder="e.g. Tango, Photography, Hiking, Music, Art"
          />
        </div>

        <div className="form-group">
          <label htmlFor="place">Place (city / town / site)*</label>
          <input
            type="text"
            id="place"
            name="place"
            value={place}
            onChange={onChange}
            required
            placeholder="Enter city, town or specific site name"
          />
          <small>Enter a city, town, or specific location name</small>
        </div>

        <div className="form-group">
          <label htmlFor="country">Country*</label>
          <Select
            id="country"
            name="country"
            value={countries.find(c => c.name === country) ? { value: country, label: country } : null}
            onChange={handleCountryChange}
            options={countries.map(c => ({ value: c.name, label: `${c.name} (${c.code})` }))}
            placeholder="Search and select country..."
            isSearchable={true}
            isClearable={true}
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: '38px',
                border: '1px solid #ccc',
                boxShadow: 'none',
                '&:hover': {
                  border: '1px solid #007bff'
                }
              })
            }}
          />
          <small>Search or select the country for this entry</small>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date*</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={onChange}
            placeholder="Any additional notes about this entry"
            rows="4"
          />
        </div>

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/entries")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading || success}>
            {success 
              ? "✅ Saved!" 
              : loading
              ? "Saving..."
              : isEditing
              ? "Update Entry"
              : "Save Entry"}
          </button>

          {/* Test Connection Button - Only show in Add mode */}
          {!isEditing && (
            <button
              type="button"
              className="test-button"
              onClick={handleTestConnection}
              disabled={loading || success}
              style={{ marginTop: "10px", backgroundColor: "#3498db" }}
            >
              Test Firebase Connection
            </button>
          )}

          {/* Test Result Display */}
          {testResult && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                borderRadius: "5px",
              }}
            >
              {testResult}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
