import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import Select from "react-select";
import "./EntryForm.css";
import countries from "../data/countries";
import MapPicker from './MapPicker';
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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const pickerCoordsRef = useRef(null);

  // Track the id of the initialData we used to populate the form so we
  // only replace the user's local edits when a *different* entry is loaded.
  // This prevents external updates to the same entry object from clobbering
  // in-progress typing (the bug the user reported).
  const initialIdRef = useRef(null);

  useEffect(() => {
    if (!initialData) return;

    // Only initialize form state when we don't yet have an initial id,
    // or when the incoming initialData represents a different entry id.
    if (initialIdRef.current && initialIdRef.current === initialData.id) {
      // Same entry; do not overwrite the user's current edits.
      return;
    }

    // Update the ref so future renders know we've initialized for this id
    initialIdRef.current = initialData.id || null;

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
      // Merge any coordinates selected via MapPicker (stored in ref) so
      // rapid submits that happen before state flush still include them.
      const coords = pickerCoordsRef.current ? { ...pickerCoordsRef.current } : {};
      const payload = { ...formData, ...coords, place: formData.place, country: formData.country };
      // Ensure MapPicker coords are always merged into the payload immediately
      // (some state updates are async; we rely on the ref as the source of truth
      // for synchronous submission). Also log using console.log so messages
      // are always visible in browser consoles regardless of log level.
      if ((!payload.latitude && payload.latitude !== 0) || (!payload.longitude && payload.longitude !== 0)) {
        if (pickerCoordsRef.current && (pickerCoordsRef.current.latitude !== undefined || pickerCoordsRef.current.longitude !== undefined)) {
          payload.latitude = pickerCoordsRef.current.latitude;
          payload.longitude = pickerCoordsRef.current.longitude;
        }
      }
      console.log('EntryForm: pickerCoordsRef.current =', pickerCoordsRef.current);
      console.log('EntryForm: final payload being submitted =', payload);
      // Prefer a provided onSubmit handler (page-level) so parent pages can
      // perform preprocessing (AddEntryPage provides an onSubmit wrapper).
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await createEntry(payload);
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => { navigate("/entries"); }, 1500);
    } catch (err) {
      // Surface geocoding errors more clearly when createEntry throws them
      const msg = err && err.message ? err.message : "Please try again.";
      setError(`Error ${isEditing ? "updating" : "creating"} entry: ${msg}`);
      // If this was a geocoding error, offer the user a map picker to select a location
      if (msg && msg.toLowerCase().includes('geocoding failed')) {
        setShowMapPicker(true);
      }
      setLoading(false);
    }
  };

  const handleMapSelect = ({ latitude, longitude, place: pickedPlace, country: pickedCountry, countryCode: pickedCountryCode }) => {
    // Store coords in a ref (synchronous) and update state so createEntry will accept them
    pickerCoordsRef.current = { latitude, longitude, place: pickedPlace, country: pickedCountry };

    // Merge into form state. If reverse geocode provided a place/country, copy them
    // Try to match the reverse geocode country to our countries list by ISO code
    let finalCountry = prevCountryName();
    function prevCountryName() {
      return (formData && formData.country) ? formData.country : '';
    }

    // Try matching by country code first (preferred)
    if (pickedCountryCode) {
      const match = countries.find(c => c.code && c.code.toUpperCase() === pickedCountryCode.toUpperCase());
      if (match) finalCountry = match.name;
    }
    // If no code match, try matching by normalized name
    if (!finalCountry && pickedCountry) {
      const norm = (s) => (s || '').toString().trim().toLowerCase();
      const pickedNorm = norm(pickedCountry);
      const matchByName = countries.find(c => norm(c.name) === pickedNorm || norm(c.name).includes(pickedNorm) || pickedNorm.includes(norm(c.name)));
      if (matchByName) finalCountry = matchByName.name;
      else finalCountry = pickedCountry;
    }

    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
      place: pickedPlace || prev.place,
      country: finalCountry || prev.country,
    }));

    setError(null);
    setShowMapPicker(false);
  };

  return (
  <div className="entry-form-container">
      <h2>{isEditing ? "Edit Entry" : "Add New Entry"}</h2>
      {error && <div className="error-message">{error}</div>}
      {/* If geocoding failed, offer a small map so the user can pick coordinates */}
      {showMapPicker && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ marginBottom: '6px' }}><strong>Pick a location on the map:</strong> click to drop a pin. This will populate the entry's coordinates.</div>
          <MapPicker initialPosition={[40.7128, -74.0060]} zoom={6} height={250} onSelect={handleMapSelect} />
        </div>
      )}
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

        {/* Allow the user to proactively open the map picker rather than only
            showing it on geocoding failure. This avoids confusion when users
            want to pick coordinates first. */}
        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setShowMapPicker((s) => !s);
              // clear any previous error when user opens picker
              if (error) setError(null);
              if (firebaseError) clearError();
            }}
            className="secondary-button"
            style={{ marginTop: '6px' }}
          >
            {showMapPicker ? 'Hide map picker' : 'Pick location on map'}
          </button>
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
