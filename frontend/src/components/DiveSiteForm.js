import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDiveSite } from "../services/diveService";
import "./DiveSiteForm.css";

const DiveSiteForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    siteName: "",
    location: "",
    date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { siteName, location, date, notes } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!siteName || !location || !date) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await createDiveSite(formData);
      setLoading(false);
      navigate("/dives");
    } catch (err) {
      setError("Error creating dive site. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="dive-site-form-container">
      <h2>Add New Dive Site</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="siteName">Site Name*</label>
          <input
            type="text"
            id="siteName"
            name="siteName"
            value={siteName}
            onChange={onChange}
            required
            placeholder="Enter the dive site name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={onChange}
            required
            placeholder="Enter city or location name"
          />
          <small>Enter a city, town, or specific location name</small>
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
            placeholder="Any additional notes about this dive"
            rows="4"
          />
        </div>

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/dives")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saving..." : "Save Dive Site"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiveSiteForm;
