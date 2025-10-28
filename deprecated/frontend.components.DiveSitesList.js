// DEPRECATED: Legacy DiveSitesList (duplicate of EntriesList). Kept for
// reference during the rename/migration. Use `frontend/src/components/EntriesList.js`.

import React from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../src/contexts/FirebaseContext";
import "../src/components/EntriesList.css";

const EntriesList = () => {
  const { entries: entriesList, loading, error, deleteEntry, retryLoadEntries } =
    useFirebase();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteEntry(id);
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  if (loading) return <div className="loading">Loading entries...</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={retryLoadEntries} className="retry-button">Retry Loading</button>
      </div>
    );
  }

  return (
    <div className="dive-sites-list-container">
      <div className="dive-sites-header">
        <h2>My Entries</h2>
        <Link to="/add" className="add-button">Add New Entry</Link>
      </div>

      {entriesList.length === 0 ? (
        <div className="no-data">
          <p>No entries found. Add your first entry!</p>
          <Link to="/add" className="add-button">Add Entry</Link>
        </div>
      ) : (
        <div className="dive-sites-grid">
          {entriesList.map((site) => (
            <div className="dive-site-card" key={site.id}>
              <h3>{site.title || site.siteName}</h3>
              {site.hobby && <div className="hobby-label">{site.hobby}</div>}
              <p><strong>Location:</strong> {site.place || site.country ? `${site.place || ""}${site.place && site.country ? ", " : ""}${site.country || ""}` : ""}</p>
              <p><strong>Date:</strong> {new Date(site.date).toLocaleDateString()}</p>

              <div className="card-actions">
                <Link to={`/edit/${site.id}`} className="edit-button">Edit</Link>
                <button onClick={() => handleDelete(site.id)} className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntriesList;
